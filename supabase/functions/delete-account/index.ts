// Deletes the signed-in person's Tolle account. Every table references auth.users with
// on delete cascade, so their copy, profile, devices and reminder log go with it.
// The caller's token is checked here (with the Auth server), so the gateway's own JWT check can stay off.
import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGINS = ["https://noahsama01.github.io", "http://localhost:5174"];
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

// the server key: the classic service_role secret, or the first of the newer secret keys
const serverKey = () => {
  const classic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (classic) return classic;
  const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
  return Object.values(keys)[0] as string;
};

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers });

  const jwt = req.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!jwt) return new Response("Not signed in", { status: 401, headers });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, serverKey(), { auth: { persistSession: false } });
  const { data, error } = await admin.auth.getUser(jwt); // the Auth server vouches for the token
  if (error || !data.user) return new Response("Not signed in", { status: 401, headers });

  const { error: gone } = await admin.auth.admin.deleteUser(data.user.id);
  if (gone) return new Response("Couldn't delete the account. Try again.", { status: 500, headers });
  return new Response(null, { status: 204, headers });
});
