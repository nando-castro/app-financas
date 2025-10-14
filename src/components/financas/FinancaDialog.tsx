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
import api from '@/services/api';
import { useState } from 'react';

export function FinancaDialog({ open, setOpen, tipo, onSave }: any) {
  const [form, setForm] = useState({
    nome: '',
    valor: '',
    dataInicio: '',
    parcelas: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);
      await api.post('/financas', {
        ...form,
        tipo,
        valor: Number(form.valor),
      });
      onSave();
      setForm({ nome: '', valor: '', dataInicio: '', parcelas: '' });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar {tipo === 'RENDA' ? 'Renda' : 'Despesa'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </div>
          <div>
            <Label>Data Início</Label>
            <Input
              type="date"
              value={form.dataInicio}
              onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
            />
          </div>
          <div>
            <Label>Parcelas (opcional)</Label>
            <Input
              type="number"
              value={form.parcelas}
              onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
            />
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
