import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    
    const { email, password, full_name } = await req.json();

    // For initial setup, allow if no admins exist; otherwise require admin role
    const { data: existingAdmins } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin");

    const isInitialSetup = !existingAdmins || existingAdmins.length === 0;

    if (!isInitialSetup) {
      if (!caller) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: callerRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (!callerRole) {
        return new Response(JSON.stringify({ error: "Only admins can create admin users" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });

    if (createError) {
      // If user already exists, get their ID and assign admin role
      if (createError.message.includes("already been registered")) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          await supabaseAdmin.from("user_roles").upsert(
            { user_id: existingUser.id, role: "admin" },
            { onConflict: "user_id,role" }
          );
          return new Response(JSON.stringify({ success: true, message: "Admin role assigned to existing user" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      throw createError;
    }

    // Assign admin role
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: newUser.user.id, role: "admin" },
      { onConflict: "user_id,role" }
    );

    return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
