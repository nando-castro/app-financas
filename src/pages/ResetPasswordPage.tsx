import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        token,
        novaSenha: senha,
      });
      toast.success("Senha redefinida com sucesso!");
      window.location.href = "/";
    } catch {
      toast.error("Token inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Definir Nova Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Button onClick={handleReset} disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
