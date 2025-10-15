import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false); // ✅ controla se já foi enviado
  const navigate = useNavigate(); // ✅ hook do react-router

  async function handleSend() {
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      toast.success("E-mail de recuperação enviado!");
      setEnviado(true);
    } catch {
      toast.error("Erro ao enviar e-mail. Verifique o endereço informado.");
    } finally {
      setLoading(false);
    }
  }

  function handleVoltar() {
    navigate("/"); // ✅ volta para a tela inicial (login)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Recuperar Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
          {!enviado ? (
            <>
              <Input
                placeholder="Digite seu e-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </Button>
            </>
          ) : (
            // ✅ mensagem de sucesso após envio
            <div className="space-y-4 text-center">
              <p className="text-green-600 font-medium">
                ✉️ E-mail enviado com sucesso!
              </p>
              <p className="text-sm text-muted-foreground">
                Um link de redefinição foi enviado para <strong>{email}</strong>.
                <br />
                Verifique sua caixa de entrada (ou a pasta de spam).
              </p>

              {/* ✅ Botão para voltar */}
              <Button onClick={handleVoltar} variant="outline" className="mt-2 w-full">
                Voltar ao início
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
