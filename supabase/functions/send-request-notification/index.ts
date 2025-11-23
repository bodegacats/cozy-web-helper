import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestNotification {
  type: 'new_request' | 'status_change';
  request: any;
  old_status?: string;
  client: {
    name: string;
    email: string;
    business_name?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const { type, request, old_status, client }: RequestNotification = await req.json();

    if (!request || !client) {
      return new Response(JSON.stringify({ error: "Missing request or client data" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let emailHtml: string;
    let subject: string;

    if (type === 'new_request') {
      subject = `New Update Request – ${client.business_name || client.name}`;
      emailHtml = `
        <h1>New Update Request from ${client.business_name || client.name}</h1>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Client:</strong> ${client.name} (${client.email})</p>
          <p><strong>Business:</strong> ${client.business_name || 'N/A'}</p>
          <p><strong>Priority:</strong> ${request.priority || 'normal'}</p>
          <p><strong>Size Tier:</strong> ${request.size_tier || 'small'}</p>
          <p><strong>Status:</strong> ${request.status}</p>
        </div>

        <h2>${request.title}</h2>
        <p>${request.description}</p>

        ${request.ai_type ? `
        <h3>AI Analysis</h3>
        <ul>
          <li><strong>Type:</strong> ${request.ai_type}</li>
          <li><strong>Confidence:</strong> ${request.ai_confidence || 'N/A'}</li>
          <li><strong>Estimated Price:</strong> $${(request.ai_price_cents || 0) / 100}</li>
          <li><strong>Quoted Price:</strong> $${(request.quoted_price_cents || 0) / 100}</li>
        </ul>
        <p><strong>Explanation:</strong> ${request.ai_explanation || 'N/A'}</p>
        ` : ''}

        ${request.attachments && request.attachments.length > 0 ? `
        <h3>Attachments</h3>
        <ul>
          ${request.attachments.map((att: any) => `<li>${att.name || att.path}</li>`).join('')}
        </ul>
        ` : ''}

        <div style="margin-top: 24px; padding: 16px; background: #e0f2fe; border-radius: 8px;">
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/admin/requests" style="color: #0369a1; font-weight: bold;">View in Admin Dashboard →</a></p>
        </div>
      `;
    } else {
      subject = `Request Status Changed – ${request.title}`;
      emailHtml = `
        <h1>Request Status Updated</h1>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Client:</strong> ${client.name}</p>
          <p><strong>Request:</strong> ${request.title}</p>
          <p><strong>Old Status:</strong> ${old_status}</p>
          <p><strong>New Status:</strong> ${request.status}</p>
        </div>

        <p>${request.description}</p>

        <div style="margin-top: 24px; padding: 16px; background: #e0f2fe; border-radius: 8px;">
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/admin/requests" style="color: #0369a1; font-weight: bold;">View in Admin Dashboard →</a></p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Build me a simple site <onboarding@resend.dev>",
      to: [Deno.env.get("ADMIN_EMAIL") || "dannymule@gmail.com"],
      subject,
      html: emailHtml,
    });

    console.log("Request notification sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (err: any) {
    console.error("send-request-notification failed:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
