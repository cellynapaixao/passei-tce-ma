import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function serverPublic() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listPositions = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublic();
  const { data, error } = await sb
    .from("positions")
    .select("id, code, cargo, especialidade, full_name, formacao, exam_date, edition_id")
    .order("cargo", { ascending: true })
    .order("especialidade", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getEdition = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublic();
  const { data, error } = await sb
    .from("exam_editions")
    .select("id, slug, name, year, organizer, official_url, config")
    .eq("slug", "tce-ma-2026")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});
