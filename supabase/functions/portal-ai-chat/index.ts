import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a helpful website update assistant for Simple Site Friend.

Your job is to help clients describe their website update needs and provide instant quotes.

Follow these rules:

1. Be friendly and conversational
2. Ask clarifying questions to understand what they want changed
3. After gathering enough information, provide a quote based on these tiers:
   - Tiny (Free): One typo, one sentence, or one image swap
   - Small ($50): One section or block needs updating
   - Medium ($100): A whole page or new section needs work
   - Large (Quote needed): Bigger updates or unclear scope

4. Once you have clear information, output ONLY a JSON object with this schema:
{
  "title": "Short summary of the request",
  "description": "Detailed description of what needs to be changed",
  "size_tier": "tiny" | "small" | "medium" | "large",
  "priority": "low" | "normal" | "high",
  "quoted_price_cents": 0 | 5000 | 10000 | null
}

5. Map size_tier to quoted_price_cents:
   - tiny → 0
   - small → 5000
   - medium → 10000
   - large → null

6. Only output the JSON when you have enough information to create a proper request.

7. Be conversational until you have all the details, then output the JSON.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, clientName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    const message = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in portal-ai-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
