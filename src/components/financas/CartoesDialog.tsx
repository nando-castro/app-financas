import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSave?: () => void;
  initialData?: any;
};

export function CartoesDialog({ open, setOpen, onSave, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    limite: "",
    diaFechamento: "",
    diaVencimento: "",
  });

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        nome: initialData.nome || "",
        limite: initialData.limite != null ? String(initialData.limite) : "",
        diaFechamento:
          initialData.diaFechamento != null ? String(initialData.diaFechamento) : "",
        diaVencimento:
          initialData.diaVencimento != null ? String(initialData.diaVencimento) : "",
      });
    } else {
      setForm({ nome: "", limite: "", diaFechamento: "", diaVencimento: "" });
    }
  }, [open, initialData]);

  function toDayOrNull(v: string) {
    if (!v) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 31) return "__INVALID__";
    return n;
  }

  async function handleSave() {
    try {
      setLoading(true);

      if (!form.nome?.trim()) {
        alert("Informe o nome do cartão.");
        return;
      }
      if (form.limite === "" || Number.isNaN(Number(form.limite)) || Number(form.limite) < 0) {
        alert("Informe um limite válido.");
        return;
      }

      const diaFechamento = toDayOrNull(form.diaFechamento);
      if (diaFechamento === "__INVALID__") {
        alert("Dia de fechamento inválido (1 a 31).");
        return;
      }

      const diaVencimento = toDayOrNull(form.diaVencimento);
      if (diaVencimento === "__INVALID__") {
        alert("Dia de vencimento inválido (1 a 31).");
        return;
      }

      const payload = {
        nome: form.nome.trim(),
        limite: Number(form.limite),
        diaFechamento: diaFechamento === null ? null : diaFechamento,
        diaVencimento: diaVencimento === null ? null : diaVencimento,
      };

      if (isEditing && initialData?.id) {
        // seu backend pode estar PATCH; se estiver PUT, mantenha PUT.
        await api.patch(`/cartoes/${initialData.id}`, payload).catch(() =>
          api.put(`/cartoes/${initialData.id}`, payload),
        );
      } else {
        await api.post("/cartoes", payload);
      }

      onSave?.();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cartão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md w-[95%] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Nubank, Inter, PicPay..."
            />
          </div>

          <div>
            <Label>Limite base</Label>
            <Input
              type="number"
              value={form.limite}
              onChange={(e) => setForm({ ...form, limite: e.target.value })}
              placeholder="Ex: 6000.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Esse é o limite padrão. Você pode definir um limite específico por mês na fatura.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label>Dia de fechamento</Label>
              <Input
                type="number"
                value={form.diaFechamento}
                onChange={(e) => setForm({ ...form, diaFechamento: e.target.value })}
                placeholder="Ex: 20"
                min={1}
                max={31}
              />
            </div>
            <div>
              <Label>Dia de vencimento</Label>
              <Input
                type="number"
                value={form.diaVencimento}
                onChange={(e) => setForm({ ...form, diaVencimento: e.target.value })}
                placeholder="Ex: 28"
                min={1}
                max={31}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
