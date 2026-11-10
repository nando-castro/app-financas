import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";

type UsuarioRecente = { nome: string; email: string };

function lerUltimoAcesso(): UsuarioRecente | null {
  try {
    const salvo = localStorage.getItem("ultimoAcesso");
    if (!salvo) return null;
    const usuario = JSON.parse(salvo) as Partial<UsuarioRecente>;
    return typeof usuario.nome === "string" && typeof usuario.email === "string"
      ? { nome: usuario.nome, email: usuario.email }
      : null;
  } catch {
    return null;
  }
}

function lerUsuarioDoToken(token: string): UsuarioRecente | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (caractere) =>
      caractere.charCodeAt(0),
    );
    const dados = JSON.parse(new TextDecoder().decode(bytes)) as Partial<UsuarioRecente>;
    return typeof dados.nome === "string" && typeof dados.email === "string"
      ? { nome: dados.nome, email: dados.email }
      : null;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const [ultimoAcesso] = useState<UsuarioRecente | null>(lerUltimoAcesso);
  const [email, setEmail] = useState(ultimoAcesso?.email ?? "");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, senha });

      localStorage.setItem("token", data.token);
      const usuario = lerUsuarioDoToken(data.token);
      if (usuario) {
        localStorage.setItem("ultimoAcesso", JSON.stringify(usuario));
        localStorage.setItem("email", usuario.email);
      }
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <Card className="w-[90%] max-w-sm shadow-md dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-slate-800 dark:text-slate-100">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          {ultimoAcesso && (
            <button
              type="button"
              onClick={() => setEmail(ultimoAcesso.email)}
              className="mb-4 flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              aria-label={`Entrar como ${ultimoAcesso.nome}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {ultimoAcesso.nome.trim().charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Último acesso · Entrar como
                </span>
                <span className="block truncate font-medium text-slate-800 dark:text-slate-100">
                  {ultimoAcesso.nome}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {ultimoAcesso.email}
                </span>
              </span>
            </button>
          )}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <Input
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-3">
            Ainda não tem conta?{" "}
            <a
              href="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Cadastre-se
            </a>
          </p>
          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-3">
            <a
              href="/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Esqueci minha senha
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
