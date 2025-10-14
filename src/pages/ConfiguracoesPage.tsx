import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [idioma, setIdioma] = useState("pt-BR");
  const [moeda, setMoeda] = useState("BRL");
  const [loading, setLoading] = useState(false);

  async function carregarPreferencias() {
    try {
      const { data } = await api.get("/usuarios/configuracoes");
      setIdioma(data.idioma || "pt-BR");
      setMoeda(data.moeda || "BRL");
      setTheme(data.tema || "light");
    } catch (error) {
      console.warn(error);
    }
  }

  async function salvarPreferencias() {
    try {
      setLoading(true);
      await api.put("/usuarios/configuracoes", {
        tema: theme,
        idioma,
        moeda,
      });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar configurações!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPreferencias();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tema */}
          <div className="flex items-center justify-between">
            <Label>Tema</Label>
            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as typeof theme)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Idioma */}
          <div className="flex items-center justify-between">
            <Label>Idioma</Label>
            <Select value={idioma} onValueChange={setIdioma}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português</SelectItem>
                <SelectItem value="en-US">Inglês</SelectItem>
                <SelectItem value="es-ES">Espanhol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Moeda */}
          <div className="flex items-center justify-between">
            <Label>Moeda</Label>
            <Select value={moeda} onValueChange={setMoeda}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (R$)</SelectItem>
                <SelectItem value="USD">Dólar (US$)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={salvarPreferencias}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
