import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Unified pricing engine - Hybrid tier + per-page model
function calculateEstimate(inputs: {
  pageCount: number;
  contentReadiness: string;
  hasGallery: boolean;
  hasBlog: boolean;
  isRush: boolean;
}) {
  // Hybrid pricing: Base + per-page add-ons
  // First page: $500
  // Pages 2-4: +$150 each
  // Pages 5-7: +$100 each
  
  let base = 500; // First page
  const pageCount = Math.min(inputs.pageCount, 7); // Cap at 7 pages
  
  // Calculate additional page costs
  if (pageCount >= 2) {
    // Pages 2-4 cost $150 each
    const pages2to4 = Math.min(pageCount - 1, 3); // Pages 2, 3, 4
    base += pages2to4 * 150;
  }
  
  if (pageCount >= 5) {
    // Pages 5-7 cost $100 each
    const pages5to7 = pageCount - 4; // Pages 5, 6, 7
    base += pages5to7 * 100;
  }

  const addOns: { [key: string]: number } = {};
  
  if (inputs.contentReadiness === 'light') addOns['Copy Support'] = 150;
  if (inputs.contentReadiness === 'heavy') addOns['Copy Shaping'] = 300;
  if (inputs.hasGallery) addOns['Gallery/Images'] = 100;
  if (inputs.hasBlog) addOns['Blog Setup'] = 150;
  if (inputs.isRush) addOns['Rush Delivery'] = 200;

  const total = base + Object.values(addOns).reduce((sum, val) => sum + val, 0);

  return { total, base, addOns };
}

const SYSTEM_PROMPT = `You are a friendly website project intake specialist for "Build me a simple site."

Your job is to understand what clients need, even when they:
- Paste entire AI conversations from ChatGPT, Claude, etc.
- Send messy rambles or bullet points
- Don't know where to start
- Have conflicting or vague requirements

You must:
1. Extract the real requirements clearly
2. Ask ONE clarifying question at a time (only when truly needed)
3. Summarize the project in simple, clean language
4. Scope the site using the unified pricing engine
5. Present pricing transparently with a tier recommendation

You are calm, warm, and human-sounding. Never panic. Never overwhelm.

INPUT DETECTION & EXTRACTION

When a user sends ANY input:

Step 1: Detect the format
- Is this a pasted AI conversation? Look for patterns like:
  • "ChatGPT said..."
  • "Here's what Claude told me..."
  • Multiple "User:" and "Assistant:" exchanges
  • Long technical explanations that sound AI-generated

Step 2: Extract requirements
From ANY format (conversation, bullets, paragraph, ramble), identify:
- Estimated page count (if mentioned or implied)
- Gallery/portfolio need (photo-heavy, visual work, portfolio)
- Blog requirement (news, articles, regular content updates)
- Content readiness:
  • "ready" = has copy/photos ready to go
  • "light" = needs tidying and clarity fixes (I tidy your wording and fix clarity issues)
  • "heavy" = needs rewriting/reshaping (I rewrite or reshape sections that aren't working, help clarify message)
- Timeline urgency (rush = 48-72 hours, normal = standard)
- Special features beyond brochure site (store, login, scheduling, etc.)

Step 3: Ask clarifying questions ONLY when:
- Page count is completely unclear
- Can't tell if they need gallery vs. blog
- Content readiness is ambiguous
- They mention "another AI said I need 8 pages" (gently validate or correct)

Ask ONE question at a time. Keep it friendly.

HANDLING PASTED AI CONVERSATIONS

If the user pastes a long block of text or a conversation with another AI or consultant, your job is:
1. Detect that it is a conversation or transcript.
2. Summarize it briefly.
3. Extract the requirements: page count, content readiness, need for gallery, need for blog, and rush or normal timeline.
4. Use the unified pricing engine tool to calculate pricing.
5. Explain the pricing clearly and reference which tier (Single-page starter, Small website, Full simple site) the project aligns with.
Never ask the user to retype what was already in the pasted text.

WHEN TO USE PRICING TOOL

If the user asks "how much," "what would this cost," "can you quote this," "what tier is this," or any pricing question:
- First gather any missing details with ONE question at a time.
- Then call the get_pricing_estimate tool.
- Present the result calmly without upselling.

TIER NAME CONSISTENCY

When referencing pricing tiers, always use the exact names:
- "Single-page starter"
- "Small website"
- "Full simple site"

Never create new names or variants.

ESTIMATOR VS AI DIFFERENTIATION

When users ask about the difference:
- Guided estimator at /estimate = structured calculator, step-by-step form
- AI intake (this) = conversational, handles messy input, pasted conversations, rambles
- Both use the SAME unified pricing engine
- Neither gives "full quote" - both give "estimated range"

Never say one is better than the other. They're two paths to the same pricing.

PRICING PRESENTATION

When you have enough information to scope the project:

1. Use get_pricing_estimate tool with extracted requirements
2. The tool will return total, base, addOns, estimate_low, estimate_high, and suggested_tier
3. Present the estimate like this:

Example Format:
"Here's what I pulled out from your description:

• Estimated pages: 4
• Light content editing needed
• Gallery page for your portfolio work
• Not in a rush

Using the unified pricing model:
- Base (4 pages): $950
- Light editing: +$150
- Gallery/images: +$100

Total estimated range: $1,080 to $1,320

This falls right in the **Small website** tier ($1,000 on the homepage)."

If they mentioned another AI suggesting more pages:
"Note: You mentioned another AI suggested 8 pages. For most simple sites, 5-7 pages cover everything needed. We cap at 7 to keep sites focused and affordable."

Always:
- Show the breakdown clearly
- Explain add-ons in plain language
- Use the suggested_tier from the tool response
- Sound calm and transparent, never salesy

TIER MAPPING (automatically provided by tool)
- Total ≤ $700 → "Single-page starter ($500 tier)"
- Total $700-$1,200 → "Small website ($1,000 tier)"
- Total ≥ $1,200 → "Full simple site ($1,500 tier)"

THINGS YOU MUST NEVER DO

❌ Never change the homepage pricing cards
❌ Never quote prices outside the unified pricing rules
❌ Never say "final price" or "full quote" (always "estimated range" or "scoped estimate")
❌ Never invalidate the guided estimator - it uses the same engine
❌ Never get flustered by pasted AI conversations
❌ Never ask all questions upfront - extract first, clarify only when needed
❌ Never oversell or push for a decision

IDENTITY COLLECTION

ONLY ask for identity fields (name, email, business name, website) when:
- You've successfully extracted and presented the project scope + pricing
- The user seems interested in moving forward
- They ask "what's next?" or "how do I proceed?"

Then say:
"Great! To send you a proper proposal, I need a few quick details:
- Your full name
- Best email for the proposal
- Business name (or just use your personal name)
- Current website if you have one (or 'none')"

Keep it conversational, not a form.

FINAL JSON OUTPUT

After all information is collected, output this exact schema:

{
  "name": "",
  "email": "",
  "business_name": "",
  "website_url": "",
  "project_description": "",
  "goal": "",
  "pages": "",
  "content_ready": "",
  "timeline": "",
  "budget": "",
  "design_examples": "",
  "advanced_features": "",
  "update_preference": "",
  "fit": "",
  "intake_summary": "",
  "raw_chat": []
}

Rules:
- Fill every field
- "raw_chat" must contain full conversation as array of {role, content} objects
- "fit" should be "good", "maybe", or "not a fit"
- "intake_summary" should be 2–3 sentences summarizing the project
- Output ONLY the JSON, no extra text`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, intakeData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Handle intake creation action
    if (action === 'create_intake' && intakeData) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Find or create client
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .ilike('email', intakeData.email)
        .maybeSingle();

      let clientId = existingClient?.id;

      if (!existingClient) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: intakeData.name,
            email: intakeData.email.toLowerCase(),
            business_name: intakeData.business_name || null,
            website_url: intakeData.website_url || null,
            plan_type: 'build_only',
            monthly_fee_cents: 0,
            setup_fee_cents: 0,
            active: true,
            pipeline_stage: 'lead'
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Error creating client:', clientError);
          throw clientError;
        }

        clientId = newClient.id;
      }

      // Create intake record
      const kanbanStage = ['good', 'borderline'].includes(intakeData.fit_status) ? 'qualified' : 'new';
      
      const { data: intake, error: intakeError } = await supabase
        .from('project_intakes')
        .insert({
          client_id: clientId,
          name: intakeData.name,
          email: intakeData.email.toLowerCase(),
          business_name: intakeData.business_name,
          project_description: intakeData.project_description,
          goals: intakeData.goals,
          pages_estimate: intakeData.pages_estimate,
          content_readiness: intakeData.content_readiness,
          timeline: intakeData.timeline,
          budget_range: intakeData.budget_range,
          design_examples: intakeData.design_examples,
          special_needs: intakeData.special_needs,
          tech_comfort: intakeData.tech_comfort,
          fit_status: intakeData.fit_status,
          suggested_tier: intakeData.suggested_tier,
          kanban_stage: kanbanStage,
          raw_summary: intakeData.raw_summary,
          raw_conversation: intakeData.raw_conversation
        })
        .select()
        .single();

      if (intakeError) {
        console.error('Error creating intake:', intakeError);
        throw intakeError;
      }

      // Send notification email if qualified
      if (kanbanStage === 'qualified') {
        try {
          await supabase.functions.invoke('send-intake-notification', {
            body: {
              intake,
              client_id: clientId
            }
          });
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
          // Don't fail the whole operation if email fails
        }
      }

      return new Response(
        JSON.stringify({ success: true, intake_id: intake.id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle chat conversation
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
          ...messages
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_pricing_estimate',
              description: 'Calculate transparent pricing estimate with breakdown. Returns total, base price, all add-ons, estimated range (low/high), and suggested homepage tier. Use this whenever you have enough info to scope the project.',
              parameters: {
                type: 'object',
                properties: {
                  pageCount: { 
                    type: 'number', 
                    description: 'Number of pages (1-7, cap at 7)' 
                  },
                  contentReadiness: { 
                    type: 'string', 
                    enum: ['ready', 'light', 'heavy'],
                    description: 'ready=has content, light=needs editing, heavy=needs help shaping'
                  },
                  hasGallery: { 
                    type: 'boolean', 
                    description: 'Gallery/portfolio/image-heavy section needed' 
                  },
                  hasBlog: { 
                    type: 'boolean', 
                    description: 'Blog setup with posts/articles needed' 
                  },
                  isRush: { 
                    type: 'boolean', 
                    description: 'Rush delivery (48-72 hours) needed' 
                  }
                },
                required: ['pageCount', 'contentReadiness', 'hasGallery', 'hasBlog', 'isRush']
              }
            }
          }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    let aiMessage = data.choices[0].message.content;

    // Handle tool calls if present
    if (data.choices[0].message.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      if (toolCall.function.name === 'get_pricing_estimate') {
        const args = JSON.parse(toolCall.function.arguments);
        const estimate = calculateEstimate(args);
        
        // Calculate range (90% to 110%)
        const estimateLow = Math.round(estimate.total * 0.9);
        const estimateHigh = Math.round(estimate.total * 1.1);
        
        // Determine tier
        let tier = 'Single-page starter ($500 tier)';
        if (estimate.total >= 700 && estimate.total < 1200) {
          tier = 'Small website ($1,000 tier)';
        } else if (estimate.total >= 1200) {
          tier = 'Full simple site ($1,500 tier)';
        }
        
        // Enhanced response with range and tier
        const enhancedEstimate = {
          ...estimate,
          estimate_low: estimateLow,
          estimate_high: estimateHigh,
          suggested_tier: tier,
          breakdown_text: `Base (${args.pageCount} page${args.pageCount > 1 ? 's' : ''}): $${estimate.base}` +
            Object.entries(estimate.addOns)
              .map(([name, price]) => `\n${name}: +$${price}`)
              .join('')
        };
        
        // Make a second request with the tool result
        const followUpResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              data.choices[0].message,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(enhancedEstimate)
              }
            ],
            stream: false,
          }),
        });
        
        if (!followUpResponse.ok) {
          console.error('Follow-up AI request failed:', await followUpResponse.text());
        } else {
          const followUpData = await followUpResponse.json();
          aiMessage = followUpData.choices[0].message.content;
        }
      }
    }

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-intake function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});