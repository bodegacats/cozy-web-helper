import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  clientName: string;
  clientEmail: string;
  tempPassword: string;
  portalUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientName, clientEmail, tempPassword, portalUrl }: InviteRequest = await req.json();

    console.log("Sending portal invite to:", clientEmail);

    const emailResponse = await resend.emails.send({
      from: "Dan @ Build Me a Simple Site <onboarding@resend.dev>",
      to: [clientEmail],
      subject: "Your client portal access",
      html: `
        <h2>Hi ${clientName},</h2>
        <p>Your client portal is now set up! You can use it to:</p>
        <ul>
          <li>View your project status</li>
          <li>Submit change requests</li>
          <li>Chat with my AI assistant</li>
        </ul>
        
        <h3>Login details:</h3>
        <p><strong>Portal URL:</strong> <a href="${portalUrl}">${portalUrl}</a></p>
        <p><strong>Email:</strong> ${clientEmail}</p>
        <p><strong>Temporary password:</strong> <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
        
        <p>Please log in and change your password to something memorable.</p>
        
        <p>If you have any trouble logging in, just reply to this email.</p>
        
        <p>Best,<br>Dan</p>
      `,
    });

    console.log("Portal invite sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending portal invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
