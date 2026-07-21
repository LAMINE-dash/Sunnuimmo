import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const { tx_ref, transaction_id } = await req.json();

    if (!tx_ref && !transaction_id) {
      return new Response(
        JSON.stringify({ error: "Référence de transaction manquante" }),
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

    const verifyUrl = transaction_id
      ? `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;

    const resp = await fetch(verifyUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${secretKey}` },
    });

    const data = await resp.json();

    if (data.status !== "success" || data.data?.status !== "successful") {
      return new Response(
        JSON.stringify({
          verified: false,
          status: data.data?.status || "failed",
          message: data.message || "Paiement non vérifié",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const txData = data.data;
    const userId = txData.meta?.user_id;
    const plan = txData.meta?.plan;
    const amount = txData.amount;
    const paymentMethod = txData.payment_type?.includes("mobile") || txData.payment_type?.includes("ussd")
      ? "orange"
      : "card";

    if (!userId || !plan) {
      return new Response(
        JSON.stringify({ verified: true, saved: false, error: "Métadonnées manquantes" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + 1);

    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan,
      amount: Math.round(amount),
      payment_method: paymentMethod,
      status: "paid",
      started_at: new Date().toISOString(),
      ends_at: endsAt.toISOString(),
    });
    if (subError) throw subError;

    const { error: profError } = await supabase
      .from("profiles")
      .update({ subscription_plan: plan })
      .eq("user_id", userId);
    if (profError) throw profError;

    return new Response(
      JSON.stringify({
        verified: true,
        saved: true,
        plan,
        amount: Math.round(amount),
        status: "paid",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
