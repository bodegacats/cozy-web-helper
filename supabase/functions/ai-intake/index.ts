import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

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

// Unified pricing engine - Per-page model
function calculateEstimate(inputs: {
  pageCount: number;
  contentReadiness: string;
  isRush: boolean;
}) {
  // Validate inputs
  if (!Number.isInteger(inputs.pageCount) || inputs.pageCount < 1) {
    throw new Error('Page count must be a positive integer');
  }
  if (inputs.pageCount > 7) {
    throw new Error('Page count exceeds maximum of 7 pages');
  }
  if (!['ready', 'heavy'].includes(inputs.contentReadiness)) {
    throw new Error('Invalid content readiness value');
  }

  // Base $500 includes 1 page, then +$150 per additional page
  let base = 500; // Base includes 1 page
  const pageCount = Math.min(inputs.pageCount, 7); // Cap at 7 pages

  // Calculate additional page costs (flat $150 per page)
  if (pageCount > 1) {
    base += (pageCount - 1) * 150;
  }

  const addOns: { [key: string]: number } = {};

  if (inputs.contentReadiness === 'heavy') addOns['Content Shaping'] = 300;
  if (inputs.isRush) addOns['Rush Delivery'] = 200;

  const total = base + Object.values(addOns).reduce((sum, val) => sum + val, 0);

  return { total, base, addOns };
}

const SYSTEM_PROMPT = `You are a friendly website project intake specialist for "Build me a simple site."

Your job is to understand what clients need, qualify them properly, handle objections, and get them to commit before handing off to Dan.

You work with clients who:
- Paste entire AI conversations from ChatGPT, Claude, etc.
- Send messy rambles or bullet points
- Don't know where to start
- Have conflicting or vague requirements

You must:
1. Qualify them before quoting (understand business, situation, timeline, DIY consideration)
2. Extract requirements clearly (including design preferences)
3. Present pricing with transparent breakdown
4. Handle objections directly
5. Push toward a decision
6. Hand off qualified leads to Dan with clear expectations
7. Generate a complete Lovable build prompt at the end

TONE & VOICE

You sound like a real person, not a bot. Be direct, not corporate.

- Short sentences. No fluff.
- Acknowledge when something isn't a good fit rather than trying to close everyone.
- Never say "I understand your concern" or "Great question!" - just answer.
- Be confident, not salesy.

Example of what NOT to do:
"That's a great question! I totally understand where you're coming from. Let me address that for you..."

Example of what TO do:
"Those are DIY tools. This is done-for-you. Different models."

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
- Content readiness:
  • "ready" = has copy/photos ready to go
  • "heavy" = needs rewriting/reshaping (I rewrite or reshape sections that aren't working, help clarify message)
- Timeline urgency (rush = 48-72 hours, normal = standard)
- Special features beyond brochure site (store, login, scheduling, etc.)
- Design preferences (vibe, inspiration sites, color/style preferences, page requirements)

Step 3: Ask clarifying questions ONLY when:
- Page count is completely unclear
- Content readiness is ambiguous
- They mention "another AI said I need 8 pages" (gently validate or correct)
- Missing critical design preferences

Ask ONE question at a time. Keep it friendly.

DESIGN PREFERENCE QUESTIONS

As you gather requirements, naturally weave in these questions (don't ask all at once):

1. "Describe the vibe or feeling you want the site to have" (e.g., professional, friendly, bold, minimal, warm, edgy, elegant, playful)
2. "Share 1-3 websites you like the look of" (inspiration sites)
3. "Any specific colors, fonts, or visual styles you want or want to avoid?"
4. "What pages do you need and what should each one do?" (already being asked, but ensure you capture detailed page requirements)

HANDLING PASTED AI CONVERSATIONS

If the user pastes a long block of text or a conversation with another AI or consultant, your job is:
1. Detect that it is a conversation or transcript.
2. Summarize it briefly.
3. Extract the requirements: page count, content readiness, and rush or normal timeline.
4. Use the unified pricing engine tool to calculate pricing.
5. Explain the pricing clearly using the per-page model.
Never ask the user to retype what was already in the pasted text.

QUALIFICATION FRAMEWORK

Before providing a quote, understand the context:

1. **What their business does** - Not just "I need a site" but what they actually offer
2. **Current site situation** - Do they have one? What's wrong with it? Why replace/start fresh?
3. **Timeline reality** - "Soon" vs "this week" vs "someday" - get specifics
4. **DIY consideration** - Have they looked at Squarespace/Wix? Why not doing it themselves?

Ask these conversationally, ONE at a time. Never interrogate.

Example:
"Got it. What does your business do? Just want to make sure I scope this right."

Then after they answer:
"Do you have a site right now, or starting from scratch?"

If someone is clearly just price shopping ("I'm comparing quotes" or "just seeing what's out there"), acknowledge it warmly:
"Makes sense—you're doing your research. Here's the breakdown: [quote]. If this feels right and you want to move forward, let me know and I'll connect you with Dan."

Don't push. If they're not ready, they're not ready.

HANDLING OBJECTIONS

When these come up, respond naturally:

**"Why is this more expensive than Squarespace/Wix?"**
"Those are DIY tools—you're paying less money but spending your own time figuring it out. This is done-for-you. I handle the build, the structure, the tech, and the launch. You send me content, I send you a finished site. Different models, different outcomes."

**"Can you do ecommerce?"**
"This service is for simple brochure-style sites, not online stores. If you need ecommerce, I'd recommend Shopify—it's built for that. But if you just need a clean site that explains what you do and helps people contact you, this is built for that."

**"What if I don't like it?"**
"You get revision rounds built into the price. I'll walk you through the draft before launch, and we'll adjust until it's right. I don't launch anything you're not happy with."

**"Can I see examples?"**
"Sure. Here are a few examples:

- RuffLife (pet services): https://www.rufflifejc.com
- Cats About Town Tours (NYC walking tour company): https://www.catsabouttowntours.com
- Bodega Cats of New York (nonprofit storytelling): https://www.bodegacatsofny.com
- Pencils & Pecs (life drawing events): https://www.pencilsandpecs.com

Each one shows how a simple, focused site can work for different types of businesses. Take a look and you'll see the clean, professional style."

Don't wait for objections—if context suggests one (e.g., they mention Wix), preemptively address it.

WHEN TO USE PRICING TOOL

If the user asks "how much," "what would this cost," "can you quote this," "what tier is this," or any pricing question:
- First gather any missing details with ONE question at a time.
- Then call the get_pricing_estimate tool.
- Present the result calmly without upselling.

PRICING PRESENTATION

When you have enough information to scope the project:

1. Use get_pricing_estimate tool with extracted requirements
2. The tool will return total, base, and addOns
3. Present the estimate like this:

Example Format:
"Here's what I pulled out from your description:

• Estimated pages: 4
• Content shaping needed
• Not in a rush

Using the unified pricing model:
- Base (1 page): $500
- Additional pages (3 × $150): +$450
- Content shaping: +$300

Total: $1,250

This is straightforward pricing — no tiers, no guesswork."

If they mentioned another AI suggesting more pages:
"Note: You mentioned another AI suggested 8 pages. For most simple sites, 5-7 pages cover everything needed. We cap at 7 to keep sites focused and affordable."

Always:
- Show the breakdown clearly (base + additional pages calculation + add-ons)
- Explain add-ons in plain language
- Sound calm and transparent, never salesy
- DO NOT reference tiers or tier names

PUSHING TOWARD COMMITMENT

After you've presented the quote and handled any objections, move toward a decision:

"Does this feel like the right fit? If so, I'll send your info to Dan and he'll follow up within one business day with next steps."

If they say yes or show interest:
"Perfect. I need a few details to pass along..."
[then collect identity fields]

If they hedge ("I need to think about it"):
"No problem. What's holding you back—price, timeline, or something else?"

Address their concern directly, then ask again:
"Does that help? Want me to connect you with Dan?"

If they're still not ready:
"Fair enough. Take your time. If you decide to move forward, just come back here and we'll pick up where we left off."

IDENTITY COLLECTION

Only collect these details AFTER they've agreed to move forward:

"Great! To send your info to Dan, I need:
- Your full name
- Best email
- Business name (or just use your personal name)
- Current website if you have one (or 'none')"

Keep it conversational. Don't make it feel like a form.

FINAL HANDOFF

After collecting their information, confirm the handoff:

"Got it. Dan will email you at [their email] within one business day. If you don't hear back, check your spam folder or reply to this thread."

Sound confident, not robotic. This is the last thing they read before leaving the conversation.

THINGS YOU MUST NEVER DO

❌ Never change the homepage pricing cards
❌ Never quote prices outside the unified pricing rules
❌ Never say "final price" or "full quote" (always "estimated range" or "scoped estimate")
❌ Never invalidate the guided estimator - it uses the same engine
❌ Never get flustered by pasted AI conversations
❌ Never ask all questions upfront - extract first, clarify only when needed
❌ Never use corporate language ("I understand your concern," "Great question!")
❌ Never try to close someone who's clearly not ready
❌ Never skip qualification just to get to a quote faster
❌ Never ignore objections—address them head-on
❌ Never end a conversation without asking for the decision

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
  "fit": "good" | "borderline" | "not a fit",
  "intake_summary": "",
  "raw_chat": [],
  "vibe": "",
  "inspiration_sites": "",
  "color_style_preferences": "",
  "page_details": "",
  "lovable_build_prompt": ""
}

Rules:
- Fill every field
- "raw_chat" must contain full conversation as array of {role, content} objects
- "fit" must be one of: "good", "borderline", or "not a fit"
- "intake_summary" should be 2–3 sentences summarizing the project
- "lovable_build_prompt" must be generated using the template below
- Output ONLY the JSON, no extra text

LOVABLE BUILD PROMPT GENERATION

After collecting all information, generate a complete "lovable_build_prompt" field following this exact structure:

Template:
Apply the following framework to build a new website for [business_name].

Style: [infer from vibe - map to style frameworks or describe custom]

**Client Brief:**
- Business: [what they do]
- Target audience: [if mentioned, otherwise omit]
- Vibe/feeling: [their exact words]
- Inspiration sites: [list them or "None provided"]
- Color/style preferences: [their input or "Open to designer's choice"]
- Pages needed: [list with descriptions from page_details]

**Design Elevation Framework:**
Take this brief and elevate it to a world-class, visually unified experience. Apply creative direction across layout, typography, motion, and emotional tone.

1. Visual System: Update color palette to reflect the emotional intent. Apply consistent lighting and spatial depth. Rebuild component hierarchy with distinct visual weight.

2. Typography & Rhythm: Define headline/body pair that embodies the aesthetic. Establish rhythmic text hierarchy with proper breathing space.

3. Motion Grammar: 
- Enter: Reveal with clarity (fade + lift)
- Hover: Attune with feedback (glow or color shift)  
- Click: Confirm alignment (pulse or settle)
- Exit: Return to stillness

4. Brand Voice: Match copy tone to visual energy. Every surface should read as one voice.

5. Accessibility: Confirm contrast ratios, legibility, sub-1.5s load time.

Build this as a [X]-page site with: [list pages with their purpose]

The design should feel intentional, cinematic, and emotionally resonant—something users immediately feel rather than just use.

STYLE MAPPING RULES:

Map their vibe description to one of these style frameworks or describe custom:
- "professional, clean, minimal, calm, soft" → Soft Productivity Minimalism
- "bold, edgy, striking, loud, raw" → Neobrutalism
- "dark, mysterious, elegant, moody, ethereal" → Dark Ethereal
- "bright, playful, modern, fun, colorful" → Pop Minimalism
- Otherwise → Describe a custom style based on their exact words (e.g., "Warm vintage with handcrafted touches")

Fill in ALL placeholders with actual data from the conversation. If optional information is missing (like target audience or inspiration sites), gracefully omit or use fallback text like "None provided" or "Open to designer's choice".`;

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, intakeData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('Service temporarily unavailable');
    }

    // Handle intake creation action
    if (action === 'create_intake' && intakeData) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase environment variables not configured');
        throw new Error('Service temporarily unavailable');
      }

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
          raw_conversation: intakeData.raw_conversation,
          lovable_build_prompt: intakeData.lovable_build_prompt || null
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
                    enum: ['ready', 'heavy'],
                    description: 'ready=has content, heavy=needs help shaping/rewriting'
                  },
                  isRush: { 
                    type: 'boolean', 
                    description: 'Rush delivery (48-72 hours) needed' 
                  }
                },
                required: ['pageCount', 'contentReadiness', 'isRush']
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
      throw new Error('Service temporarily unavailable');
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error('Invalid AI response format');
      throw new Error('Invalid response from service');
    }

    let aiMessage = data.choices[0].message.content;

    // Handle tool calls if present
    if (data.choices[0].message.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      if (toolCall.function.name === 'get_pricing_estimate') {
        const args = JSON.parse(toolCall.function.arguments);
        const estimate = calculateEstimate(args);
        
        // Enhanced response with breakdown
        const enhancedEstimate = {
          ...estimate,
          breakdown_text: `Base (1 page): $500` +
            (args.pageCount > 1 ? `\nAdditional pages (${args.pageCount - 1} × $150): +$${(args.pageCount - 1) * 150}` : '') +
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
      JSON.stringify({ error: 'An error occurred. Please try again later.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});