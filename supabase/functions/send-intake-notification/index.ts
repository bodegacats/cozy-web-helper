import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  intake: any;
  client_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intake, client_id }: NotificationRequest = await req.json();

    const fitBadge = intake.fit_status === 'good' ? '✅ Good Fit' : 
                     intake.fit_status === 'borderline' ? '⚠️ Borderline' : 
                     '❌ Not a Fit';
    
    const tierLabel = intake.suggested_tier ? `$${intake.suggested_tier}` : 'Not determined';

    const emailHtml = `
      <h1>New AI Intake – ${intake.business_name || intake.name}</h1>
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Fit Status:</strong> ${fitBadge}</p>
        <p><strong>Suggested Tier:</strong> ${tierLabel}</p>
        <p><strong>Email:</strong> ${intake.email}</p>
        <p><strong>Created:</strong> ${new Date(intake.created_at).toLocaleString()}</p>
      </div>

      <h2>Summary</h2>
      <p>${intake.raw_summary || 'No summary provided'}</p>

      <h2>Key Details</h2>
      <ul>
        <li><strong>What they do:</strong> ${intake.project_description || 'N/A'}</li>
        <li><strong>Goals:</strong> ${intake.goals || 'N/A'}</li>
        <li><strong>Pages needed:</strong> ${intake.pages_estimate || 'Not specified'}</li>
        <li><strong>Content readiness:</strong> ${intake.content_readiness || 'N/A'}</li>
        <li><strong>Timeline:</strong> ${intake.timeline || 'N/A'}</li>
        <li><strong>Budget:</strong> ${intake.budget_range || 'N/A'}</li>
        <li><strong>Special needs:</strong> ${intake.special_needs || 'None mentioned'}</li>
        <li><strong>Tech comfort:</strong> ${intake.tech_comfort || 'N/A'}</li>
      </ul>

      <div style="margin-top: 24px; padding: 16px; background: #e0f2fe; border-radius: 8px;">
        <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/admin/intakes" style="color: #0369a1; font-weight: bold;">View in Admin Dashboard →</a></p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Simple Site Friend <onboarding@resend.dev>",
      to: ["dannymule@gmail.com"], // Your admin email
      subject: `New AI intake – ${intake.business_name || intake.name}`,
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
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);