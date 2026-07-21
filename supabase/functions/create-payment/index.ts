import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { plan, amount, email, name, phone, user_id } = await req.json();

    if (!plan || !amount || !email || !user_id) {
      return new Response(
        JSON.stringify({ error: "Paramètres manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretKey = Deno.env.get("FLW_SECRET_KEY");
    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: "Clé Flutterwave non configurée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const txRef = `TERANGA-${plan}-${user_id.slice(0, 8)}-${Date.now()}`;

    const body = {
      tx_ref: txRef,
      amount: String(amount),
      currency: "XOF",
      redirect_url: `${req.headers.get("origin") || "https://terangaimmo.app"}/?page=payment&planId=${plan}&txRef=${txRef}`,
      customer: {
        email,
        name: name || email,
        phonenumber: phone || "",
      },
      customizations: {
        title: "TerangaImmo",
        description: `Abonnement ${plan} - TerangaImmo`,
        logo: "https://terangaimmo.app/logo.png",
      },
      payment_options: "mobilemoneyghana,card,ussd",
      meta: {
        user_id,
        plan,
      },
    };

    const resp = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (data.status !== "success") {
      return new Response(
        JSON.stringify({ error: data.message || "Échec de l'initialisation du paiement" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ link: data.data.link, txRef }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
