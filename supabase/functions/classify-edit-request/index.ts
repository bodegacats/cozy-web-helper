import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get allowed origins from environment or use secure defaults
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://cozy-web-helper.lovable.app',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();

    if (!description || description.length < 10) {
      return new Response(
        JSON.stringify({
          error: 'Description is too short. Please provide more details.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('Service temporarily unavailable');
    }

    const systemPrompt = `You classify website update requests into two categories:

1. FREE EDITS (always free):
- Fixing a typo or spelling error
- Replacing an existing photo with a new one
- Changing a few words or one sentence
- Updating a phone number, address, email, or hours
- Simple text swap within an existing block
- Changing 1–2 images in a gallery without layout changes
- Adding or removing one item in an existing list

2. PAID EDITS:
- Anything requiring layout changes
- Adding new sections or pages
- Rewriting multiple paragraphs or reworking structure
- Changing navigation, headings, or page flow
- Adding new functionality (forms, galleries, buttons, embeds, etc.)
- Design revisions beyond a small tweak
- Anything taking more than a few minutes

Pricing rules:
- Small paid edits: $50
- Medium edits: $100–$150
- Large edits (new sections/pages/features): $200–$350
- If the request is unclear, mark confidence as "low" rather than inventing details.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Classify this website edit request: "${description}"` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_edit_request",
              description: "Classify a website edit request and provide pricing",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["free", "paid"] },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                  explanation: { type: "string" },
                  recommended_price: { type: "number", enum: [0, 50, 100, 150, 200, 250, 300, 350] }
                },
                required: ["type", "confidence", "explanation", "recommended_price"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "classify_edit_request" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service unavailable. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Service temporarily unavailable');
    }

    const data = await response.json();

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('Invalid AI response format:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response from service');
    }

    const classification = JSON.parse(toolCall.function.arguments);

    // Validate the response
    if (!classification.type || !classification.confidence || !classification.explanation ||
        classification.recommended_price === undefined) {
      console.error('Incomplete classification from AI');
      throw new Error('Invalid response from service');
    }

    return new Response(
      JSON.stringify(classification),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Classification error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred. Please try again later.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
