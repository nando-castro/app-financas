import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/services/api';
import { useEffect, useState } from 'react';

export function FinancaDialog({ open, setOpen, tipo, onSave }: any) {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    valor: '',
    dataInicio: '',
    dataFim: '',
    parcelas: '',
    categoriaId: '',
  });

  useEffect(() => {
    if (open) carregarCategorias();
  }, [open]);

  async function carregarCategorias() {
    try {
      const { data } = await api.get('/categorias');
      setCategorias(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave() {
    try {
      setLoading(true);
      await api.post('/financas', {
        nome: form.nome,
        valor: Number(form.valor),
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || null,
        parcelas: form.parcelas ? Number(form.parcelas) : null,
        tipo,
        categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
      });
      onSave();
      setForm({
        nome: '',
        valor: '',
        dataInicio: '',
        dataFim: '',
        parcelas: '',
        categoriaId: '',
      });
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar finança');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md w-[95%] rounded-lg">
        <DialogHeader>
          <DialogTitle>
            Adicionar {tipo === 'RENDA' ? 'Renda' : 'Despesa'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Nome */}
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Salário, Conta de Luz..."
            />
          </div>

          {/* Valor */}
          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder="Ex: 1500.00"
            />
          </div>

          {/* Categoria */}
          <div>
            <Label>Categoria</Label>
            <Select
              value={form.categoriaId}
              onValueChange={(v) => setForm({ ...form, categoriaId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={form.dataInicio}
                onChange={(e) =>
                  setForm({ ...form, dataInicio: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Data Fim (opcional)</Label>
              <Input
                type="date"
                value={form.dataFim}
                onChange={(e) =>
                  setForm({ ...form, dataFim: e.target.value })
                }
              />
            </div>
          </div>

          {/* Parcelas */}
          <div>
            <Label>Parcelas (opcional)</Label>
            <Input
              type="number"
              value={form.parcelas}
              onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
              placeholder="Ex: 12"
            />
            <p className="text-xs text-slate-500 mt-1">
              Se informar parcelas, a data fim será calculada automaticamente.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
