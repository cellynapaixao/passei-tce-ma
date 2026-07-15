import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Landmark, MailCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "recovery"]).catch("signin").optional(),
});

const emailSchema = z.string().trim().email("Digite um email válido.");
const passwordSchema = z.string().min(8, "Use pelo menos 8 caracteres na senha.");

type AuthMode = "signin" | "signup" | "forgot" | "recovery";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou senha incorretos.",
  email_not_confirmed: "Confirme seu email antes de entrar.",
  user_already_exists: "Este email já possui uma conta. Entre com sua senha.",
  weak_password: "Crie uma senha mais forte, com pelo menos 8 caracteres.",
  over_email_send_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
};

function getAuthErrorMessage(error: unknown) {
  const authError =
    typeof error === "object" && error ? (error as { code?: string; message?: string }) : {};
  if (authError.code && AUTH_ERROR_MESSAGES[authError.code]) {
    return AUTH_ERROR_MESSAGES[authError.code];
  }
  const message = authError.message?.toLowerCase() ?? "";
  if (message.includes("already registered") || message.includes("already exists")) {
    return AUTH_ERROR_MESSAGES.user_already_exists;
  }
  if (message.includes("invalid login") || message.includes("invalid credentials")) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }
  if (message.includes("email not confirmed")) return AUTH_ERROR_MESSAGES.email_not_confirmed;
  return "Não foi possível concluir. Tente novamente.";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Acessar conta | Passei! TCE-MA" },
      { name: "description", content: "Crie sua conta ou entre para salvar seu progresso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session && search.mode !== "recovery") {
      throw redirect({ to: "/treino", search: { mode: undefined } });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<AuthMode>(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function changeMode(next: AuthMode) {
    setMode(next);
    setPassword("");
    setShowPassword(false);
    setErrorMessage("");
    setNotice("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setNotice("");

    const cleanEmail = email.trim().toLowerCase();
    if (mode !== "recovery") {
      const emailResult = emailSchema.safeParse(cleanEmail);
      if (!emailResult.success) {
        setErrorMessage(emailResult.error.issues[0]?.message ?? "Digite um email válido.");
        return;
      }
    }
    if (mode !== "forgot") {
      const passwordResult =
        mode === "signin"
          ? z.string().min(1, "Digite sua senha.").safeParse(password)
          : passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        setErrorMessage(passwordResult.error.issues[0]?.message ?? "Verifique sua senha.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: window.location.origin + "/treino" },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Conta criada. Abra o email de confirmação para entrar.");
          return;
        }
        toast.success("Conta criada. Seu treino está pronto.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin + "/auth?mode=recovery",
        });
        if (error) throw error;
        setNotice("Se o email estiver cadastrado, você receberá o link de recuperação.");
        return;
      } else if (mode === "recovery") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Senha atualizada com segurança.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      }
      navigate({ to: "/treino", search: { mode: undefined } });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "signup"
      ? "Crie sua conta"
      : mode === "forgot"
        ? "Recupere seu acesso"
        : mode === "recovery"
          ? "Crie uma nova senha"
          : "Entre na sua conta";

  return (
    <main
      id="conteudo-principal"
      className="auth-page min-h-dvh bg-background px-4 pb-8 pt-6 sm:px-6 md:grid md:place-items-center md:py-10"
    >
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Voltar ao início
        </Link>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-[var(--surface-1)] shadow-2xl shadow-black/25">
          <div className="border-b border-border/70 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3 font-display text-lg font-semibold">
              <span className="grid size-10 place-items-center rounded-lg border border-[var(--gold)]/60 text-[var(--gold)]">
                <Landmark className="size-5" aria-hidden />
              </span>
              <span>
                Passei! <span className="text-[var(--gold)]">TCE-MA</span>
              </span>
            </div>
          </div>

          {(mode === "signin" || mode === "signup") && (
            <div
              className="grid grid-cols-2 border-b border-border"
              role="tablist"
              aria-label="Acesso à conta"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                onClick={() => changeMode("signin")}
                className={`min-h-12 border-b-2 px-4 text-sm font-semibold ${mode === "signin" ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => changeMode("signup")}
                className={`min-h-12 border-b-2 px-4 text-sm font-semibold ${mode === "signup" ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Criar conta
              </button>
            </div>
          )}

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <h1 className="font-display text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {mode === "signup"
                ? "Apenas email e senha. Cargo e preferências continuam opcionais."
                : mode === "forgot"
                  ? "Informe seu email para receber um link seguro."
                  : mode === "recovery"
                    ? "Use pelo menos 8 caracteres para proteger sua conta."
                    : "Acesse seu progresso com o mesmo email em qualquer dispositivo."}
            </p>

            {notice && (
              <div
                role="status"
                className="mt-5 flex gap-3 rounded-lg border border-[var(--correct)]/50 bg-[var(--correct)]/10 p-3 text-sm"
              >
                <MailCheck className="mt-0.5 size-5 shrink-0 text-[var(--correct)]" aria-hidden />
                <span>{notice}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {mode !== "recovery" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint={mode === "forgot" ? "send" : "next"}
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errorMessage}
                    className="h-12 bg-[var(--surface-2)] px-4"
                  />
                </div>
              )}

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">{mode === "recovery" ? "Nova senha" : "Senha"}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                      minLength={mode === "signin" ? undefined : 8}
                      enterKeyHint="done"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errorMessage}
                      className="h-12 bg-[var(--surface-2)] px-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-md text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" aria-hidden />
                      ) : (
                        <Eye className="size-5" aria-hidden />
                      )}
                    </button>
                  </div>
                  {mode !== "signin" && (
                    <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
                  )}
                </div>
              )}

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/60 bg-destructive/10 p-3 text-sm"
                >
                  {errorMessage}
                </p>
              )}

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading
                  ? "Aguarde…"
                  : mode === "signup"
                    ? "Criar conta"
                    : mode === "forgot"
                      ? "Enviar link de recuperação"
                      : mode === "recovery"
                        ? "Salvar nova senha"
                        : "Entrar"}
              </Button>
            </form>

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => changeMode("forgot")}
                className="mt-5 min-h-11 w-full text-center text-sm text-[var(--gold)] hover:underline"
              >
                Esqueci minha senha
              </button>
            )}
            {(mode === "forgot" || mode === "recovery") && (
              <button
                type="button"
                onClick={() => changeMode("signin")}
                className="mt-5 min-h-11 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Voltar para entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
