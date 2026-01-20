// supabase/functions/send-user-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*";

  // Handle preflight OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "Access-Control-Allow-Origin": origin },
    });
  }

  try {
    const { type, email, username, role, tempPassword } = await req.json();

    const subject = type === "add" ? "Your Account is Ready" : "Your Account Updated";
    const html = type === "add"
      ? `<p>Hello ${username}, your temporary password is: <b>${tempPassword}</b></p>`
      : `<p>Hello ${username}, your account details were updated.</p>`;

    const RESEND_API_KEY = Deno.env.get("re_PEmvTWN1_3yY1F2CLTjdP76v7K4XGWkcj");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AssetPro <no-reply@assetpro.com>",
        to: email,
        subject,
        html,
      }),
    });

    const result = await res.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json",
      },
    });
  }
});
