import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 'intake' | 'lead' | 'request';

interface NotificationRequest {
  type: NotificationType;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();
    console.log(`Processing ${type} notification:`, data);

    if (!type || !data) {
      return new Response(JSON.stringify({ error: "Missing type or data" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case 'intake':
        subject = `🤖 New AI Intake: ${data.business_name || data.name}`;
        const fitBadge = data.fit_status === 'good' ? '✅ Good Fit' :
                         data.fit_status === 'borderline' ? '⚠️ Borderline' :
                         '❌ Not a Fit';
        const tierLabel = data.suggested_tier || 'Not determined';

        htmlContent = `
          <h1>New AI Intake – ${data.business_name || data.name}</h1>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Fit Status:</strong> ${fitBadge}</p>
            <p><strong>Suggested Tier:</strong> ${tierLabel}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Name:</strong> ${data.name}</p>
          </div>
          <h2>Summary</h2>
          <p>${data.raw_summary || 'No summary provided'}</p>
          <h2>Key Details</h2>
          <ul>
            <li><strong>What they do:</strong> ${data.project_description || 'N/A'}</li>
            <li><strong>Goals:</strong> ${data.goals || 'N/A'}</li>
            <li><strong>Pages needed:</strong> ${data.pages_estimate || 'Not specified'}</li>
            <li><strong>Content readiness:</strong> ${data.content_readiness || 'N/A'}</li>
            <li><strong>Timeline:</strong> ${data.timeline || 'N/A'}</li>
            <li><strong>Budget:</strong> ${data.budget_range || 'N/A'}</li>
            <li><strong>Special needs:</strong> ${data.special_needs || 'None mentioned'}</li>
            <li><strong>Tech comfort:</strong> ${data.tech_comfort || 'N/A'}</li>
            <li><strong>Discount:</strong> ${data.discount_offered ? `$${data.discount_amount || 0} offered` : 'No discount offered'}</li>
          </ul>
        `;
        break;

      case 'lead':
        const leadSource = data.source || 'unknown';
        
        switch (leadSource) {
          case "quote":
            subject = `💰 New Quote Request: ${data.name}`;
            htmlContent = `
              <h2>New Instant Quote</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Pages:</strong> ${data.page_count || "N/A"}</p>
              <p><strong>Content Shaping:</strong> ${data.content_shaping ? "Yes" : "No"}</p>
              <p><strong>Rush:</strong> ${data.rush ? "Yes" : "No"}</p>
              <p><strong>Estimated Price:</strong> $${data.estimated_price ? (data.estimated_price / 100).toFixed(2) : "N/A"}</p>
              ${data.project_notes ? `<p><strong>Notes:</strong> ${data.project_notes}</p>` : ""}
            `;
            break;

          case "checkup":
            subject = `🔍 New Site Checkup: ${data.name}`;
            htmlContent = `
              <h2>New $50 Site Checkup</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Website:</strong> ${data.website_url || "N/A"}</p>
              <p><strong>Wish:</strong> ${data.wish || "N/A"}</p>
            `;
            break;

          case "contact":
            subject = `📧 New Contact: ${data.name}`;
            htmlContent = `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              ${data.business_description ? `<p><strong>Message:</strong> ${data.business_description}</p>` : ""}
            `;
            break;

          default:
            subject = `📬 New Lead: ${data.name}`;
            htmlContent = `
              <h2>New Lead Submission</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Source:</strong> ${data.source}</p>
            `;
        }
        break;

      case 'request':
        const isStatusChange = data.type === 'status_change';
        subject = isStatusChange 
          ? `🔄 Request ${data.request.status.toUpperCase()}: ${data.request.title}`
          : `🆕 New Request from ${data.client.name}: ${data.request.title}`;

        htmlContent = isStatusChange ? `
          <h2>Request Status Updated</h2>
          <p><strong>Client:</strong> ${data.client.name} (${data.client.email})</p>
          <p><strong>Request:</strong> ${data.request.title}</p>
          <p><strong>New Status:</strong> <span style="background: #e0f2fe; padding: 4px 8px; border-radius: 4px;">${data.request.status}</span></p>
          <p><strong>Description:</strong></p>
          <p style="background: #f9fafb; padding: 12px; border-radius: 4px;">${data.request.description}</p>
        ` : `
          <h2>New Update Request</h2>
          <p><strong>Client:</strong> ${data.client.name}</p>
          <p><strong>Email:</strong> ${data.client.email}</p>
          <p><strong>Business:</strong> ${data.client.business_name || 'N/A'}</p>
          <hr>
          <h3>${data.request.title}</h3>
          <p><strong>Description:</strong></p>
          <p style="background: #f9fafb; padding: 12px; border-radius: 4px; white-space: pre-wrap;">${data.request.description}</p>
          <p><strong>Priority:</strong> ${data.request.priority}</p>
          <p><strong>Status:</strong> ${data.request.status}</p>
          ${data.request.attachments && data.request.attachments.length > 0 ? `
            <p><strong>Attachments:</strong> ${data.request.attachments.length} file(s)</p>
          ` : ''}
        `;
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown notification type: ${type}` }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    const emailResponse = await resend.emails.send({
      from: "Build me a simple site <onboarding@resend.dev>",
      to: [adminEmail!],
      subject,
      html: htmlContent,
    });

    console.log(`${type} notification sent successfully:`, emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
