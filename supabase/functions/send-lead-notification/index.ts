import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Lead {
  name: string;
  email: string;
  source: string;
  page_count?: number;
  content_shaping?: boolean;
  rush?: boolean;
  estimated_price?: number;
  business_name?: string;
  business_description?: string;
  project_notes?: string;
  website_url?: string;
  wish?: string;
  design_prompt?: string;
  fit_status?: string;
  suggested_tier?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead }: { lead: Lead } = await req.json();
    console.log("Processing lead notification:", lead.source, lead.name);

    let subject = "";
    let htmlContent = "";

    // Template based on source
    switch (lead.source) {
      case "ai_intake":
        subject = `🤖 New AI Intake: ${lead.name}`;
        htmlContent = `
          <h2>New AI Intake Submission</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Business:</strong> ${lead.business_name || "N/A"}</p>
          <p><strong>Fit Status:</strong> ${lead.fit_status || "N/A"}</p>
          <p><strong>Suggested Tier:</strong> ${lead.suggested_tier || "N/A"}</p>
          <p><strong>Estimated Price:</strong> $${lead.estimated_price ? (lead.estimated_price / 100).toFixed(2) : "N/A"}</p>
          ${lead.business_description ? `<p><strong>Description:</strong> ${lead.business_description}</p>` : ""}
          ${lead.design_prompt ? `<hr><h3>Design Prompt</h3><pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; white-space: pre-wrap;">${lead.design_prompt}</pre>` : ""}
        `;
        break;

      case "quote":
        subject = `💰 New Quote Request: ${lead.name}`;
        htmlContent = `
          <h2>New Instant Quote</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Pages:</strong> ${lead.page_count || "N/A"}</p>
          <p><strong>Content Shaping:</strong> ${lead.content_shaping ? "Yes" : "No"}</p>
          <p><strong>Rush:</strong> ${lead.rush ? "Yes" : "No"}</p>
          <p><strong>Estimated Price:</strong> $${lead.estimated_price ? (lead.estimated_price / 100).toFixed(2) : "N/A"}</p>
          ${lead.project_notes ? `<p><strong>Notes:</strong> ${lead.project_notes}</p>` : ""}
        `;
        break;

      case "checkup":
        subject = `🔍 New Site Checkup: ${lead.name}`;
        htmlContent = `
          <h2>New $50 Site Checkup</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Website:</strong> ${lead.website_url || "N/A"}</p>
          <p><strong>Wish:</strong> ${lead.wish || "N/A"}</p>
        `;
        break;

      case "contact":
        subject = `📧 New Contact: ${lead.name}`;
        htmlContent = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          ${lead.business_description ? `<p><strong>Message:</strong> ${lead.business_description}</p>` : ""}
        `;
        break;

      default:
        subject = `📬 New Lead: ${lead.name}`;
        htmlContent = `
          <h2>New Lead Submission</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Source:</strong> ${lead.source}</p>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "Leads <onboarding@resend.dev>",
      to: [adminEmail!],
      subject,
      html: htmlContent,
    });

    console.log("Lead notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-lead-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
