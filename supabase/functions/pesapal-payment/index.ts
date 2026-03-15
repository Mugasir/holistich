import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PESAPAL_BASE = "https://pay.pesapal.com/v3/api";

async function getToken(): Promise<string> {
  const key = Deno.env.get("PESAPAL_CONSUMER_KEY");
  const secret = Deno.env.get("PESAPAL_CONSUMER_SECRET");
  if (!key || !secret) throw new Error("Pesapal credentials not configured");

  const res = await fetch(`${PESAPAL_BASE}/Auth/RequestToken`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`);
  return data.token;
}

async function registerIPN(token: string, callbackUrl: string): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: callbackUrl,
      ipn_notification_type: "GET",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`IPN registration failed: ${JSON.stringify(data)}`);
  return data.ipn_id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Handle IPN callback
    if (path === "ipn" && req.method === "GET") {
      const orderTrackingId = url.searchParams.get("OrderTrackingId");
      const orderMerchantReference = url.searchParams.get("OrderMerchantReference");

      if (orderTrackingId && orderMerchantReference) {
        const token = await getToken();
        // Get transaction status
        const statusRes = await fetch(
          `${PESAPAL_BASE}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const statusData = await statusRes.json();

        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Map Pesapal status to our status
        let orderStatus = "pending";
        if (statusData.payment_status_description === "Completed") {
          orderStatus = "paid";
        } else if (statusData.payment_status_description === "Failed") {
          orderStatus = "pending"; // keep as pending so user can retry
        }

        await supabase
          .from("orders")
          .update({
            status: orderStatus,
            payment_reference: orderTrackingId,
          })
          .eq("id", orderMerchantReference);
      }

      return new Response(JSON.stringify({ status: 200 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Submit order request
    if (path === "submit" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Verify user
      const supabaseAnon = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!
      );
      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { orderId, callbackUrl } = await req.json();

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = await getToken();

      // Register IPN URL
      const projectId = Deno.env.get("SUPABASE_URL")!.split("//")[1].split(".")[0];
      const ipnUrl = `https://${projectId}.supabase.co/functions/v1/pesapal-payment/ipn`;
      const ipnId = await registerIPN(token, ipnUrl);

      // Submit order to Pesapal
      const submitRes = await fetch(`${PESAPAL_BASE}/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: orderId,
          currency: "UGX",
          amount: order.total,
          description: `Holistic Haven Order ${orderId.slice(0, 8).toUpperCase()}`,
          callback_url: callbackUrl,
          notification_id: ipnId,
          billing_address: {
            phone_number: order.delivery_phone,
            email_address: user.email,
            first_name: user.user_metadata?.full_name?.split(" ")[0] || "",
            last_name: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
            line_1: order.delivery_address,
            city: order.delivery_city,
            country_code: "UG",
          },
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(`Pesapal submit failed: ${JSON.stringify(submitData)}`);
      }

      // Update order with tracking id
      await supabase
        .from("orders")
        .update({ payment_reference: submitData.order_tracking_id })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({
          redirect_url: submitData.redirect_url,
          order_tracking_id: submitData.order_tracking_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Pesapal error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
