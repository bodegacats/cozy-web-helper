import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteNotificationRequest {
  name: string;
  email: string;
  pageCount: number;
  contentShaping: boolean;
  rushDelivery: boolean;
  totalPrice: number;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, pageCount, contentShaping, rushDelivery, totalPrice, notes }: QuoteNotificationRequest = await req.json();
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured - email will not be sent");
      return new Response(
        JSON.stringify({ message: "Email notification not configured" }), 
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending quote notification for:", email);

    const emailHtml = `
      <h2>New Instant Quote Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      
      <h3>Quote Details:</h3>
      <p><strong>Page count:</strong> ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}</p>
      <p><strong>Content shaping:</strong> ${contentShaping ? 'Yes' : 'No'}</p>
      <p><strong>Rush delivery:</strong> ${rushDelivery ? 'Yes' : 'No'}</p>
      <p><strong>Total estimated price:</strong> $${totalPrice.toLocaleString()}</p>
      
      ${notes ? `
        <h3>Notes:</h3>
        <p>${notes}</p>
      ` : '<p><em>No notes provided</em></p>'}
      
      <hr />
      <p><em>Submitted at: ${new Date().toISOString()}</em></p>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Quote Submissions <onboarding@resend.dev>",
        to: ["dannymule@gmail.com"],
        subject: "New instant quote submission",
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-quote-notification function:", error);
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
