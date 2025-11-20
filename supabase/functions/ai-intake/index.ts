import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the Website Project Intake Assistant for Simple Site Friend.
Your job is to run a clean, friendly, SHORT website intake that captures the required project details AND always collects the user's identity first.

Follow these rules:

1. ALWAYS start by collecting identity fields before anything else

Ask these questions exactly, in order, and wait for answers:

"What's your full name?"

"What's the best email to send the proposal and follow ups?"

"Do you have a business name or should I just use your personal name?"

"Do you have a current website? If yes, paste it. If no, say 'none'."

These are required fields and must be filled before moving on.

2. Then run the project intake

Ask these exact questions, one at a time:

"In one or two sentences, what are you building? What's the site for?"

"What do you want the website to accomplish?"

"Roughly how many pages are you thinking?"

"Do you already have your words and photos ready?"

"What timeline are you hoping for?"

"What budget are you working with?"

"Paste 1–2 websites you like."

"Do you need anything beyond a simple brochure site? (e.g., store, login system, scheduling, directory, etc.)"

"Do you want to update the site yourself, or send updates to me?"

3. ALWAYS output the final result as a structured JSON object

Use this exact schema (do not change field names):

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

Fill every field.

"raw_chat" must contain the full conversation as an array of {role, content} objects (like OpenAI chat format).

"fit" should be "good", "maybe", or "not a fit."

"intake_summary" should be 2–3 sentences summarizing the project.

4. Tone and experience

Be concise and friendly.

Do NOT give pricing unless the user specifically asks.

Do NOT oversell.

The job is to gather information, not close.

5. If the user refuses to give a field

Say:
"I need that to create your record. If you prefer not to share it, I'll mark it as 'unknown'."

6. End of conversation

After all fields are collected, output:

ONLY the JSON.
No extra text.
No commentary.
No formatting outside the JSON block.`;

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
    const aiMessage = data.choices[0].message.content;

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