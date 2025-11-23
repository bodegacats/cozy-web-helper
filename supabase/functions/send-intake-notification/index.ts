import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  lead: any;
  client_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const { lead }: NotificationRequest = await req.json();

    if (!lead) {
      return new Response(JSON.stringify({ error: "Missing lead payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const fitBadge = lead.fit_status === 'good' ? '✅ Good Fit' :
                     lead.fit_status === 'borderline' ? '⚠️ Borderline' :
                     '❌ Not a Fit';

    const tierLabel = lead.suggested_tier ? `$${lead.suggested_tier}` : 'Not determined';

    const emailHtml = `
      <h1>New AI Intake – ${lead.business_name || lead.name}</h1>

      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Fit Status:</strong> ${fitBadge}</p>
        <p><strong>Suggested Tier:</strong> ${tierLabel}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Created:</strong> ${new Date(lead.created_at).toLocaleString()}</p>
      </div>

      <h2>Summary</h2>
      <p>${lead.raw_summary || 'No summary provided'}</p>

      <h2>Key Details</h2>
      <ul>
        <li><strong>What they do:</strong> ${lead.project_description || 'N/A'}</li>
        <li><strong>Goals:</strong> ${lead.goals || 'N/A'}</li>
        <li><strong>Pages needed:</strong> ${lead.pages_estimate || 'Not specified'}</li>
        <li><strong>Content readiness:</strong> ${lead.content_readiness || 'N/A'}</li>
        <li><strong>Timeline:</strong> ${lead.timeline || 'N/A'}</li>
        <li><strong>Budget:</strong> ${lead.budget_range || 'N/A'}</li>
        <li><strong>Special needs:</strong> ${lead.special_needs || 'None mentioned'}</li>
        <li><strong>Tech comfort:</strong> ${lead.tech_comfort || 'N/A'}</li>
        <li><strong>Discount:</strong> ${lead.discount_offered ? `$${lead.discount_amount || 0} offered` : 'No discount offered'}</li>
      </ul>

      <div style="margin-top: 24px; padding: 16px; background: #e0f2fe; border-radius: 8px;">
        <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/admin/intakes" style="color: #0369a1; font-weight: bold;">View in Admin Dashboard →</a></p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Build me a simple site <onboarding@resend.dev>",
      to: ["dannymule@gmail.com"], // Your admin email
      subject: `New AI intake – ${lead.business_name || lead.name}`,
      html: emailHtml,
    });

    console.log("Notification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (err: any) {
    console.error("send-intake-notification failed:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
