import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).catch("signin").optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Entrar — Passei! TCE-MA" },
      { name: "description", content: "Acesse sua conta e comece o treino imediatamente." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/treino", search: { mode: undefined } });
  },
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/treino" },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Conta criada. Confirme o email para entrar.");
          setMode("signin");
          return;
        }
        toast.success("Conta criada. Iniciando treino…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/treino", search: { mode: undefined } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      id="conteudo-principal"
      className="flex min-h-dvh items-center justify-center bg-background px-4 py-10"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-[var(--surface-1)] p-6 shadow-2xl md:p-8">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Voltar
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {mode === "signup" ? "Criar sua conta" : "Entrar na sua conta"}
        </h1>
        <p className="mt-1 font-display text-sm font-semibold text-[var(--gold)]">Passei! TCE-MA</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Apenas email e senha. Cargo e preferências são opcionais e ficam para depois.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
            />
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
            )}
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? "Aguarde…" : mode === "signup" ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signup" ? "Já tenho conta — entrar" : "Não tenho conta — criar agora"}
        </button>
      </div>
    </main>
  );
}
