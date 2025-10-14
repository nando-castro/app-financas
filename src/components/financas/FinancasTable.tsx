import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FinancaDialog } from './FinancaDialog';

export function FinancasTable({ financas, tipo, onRefresh }: any) {
  const [selected, setSelected] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [openEdit, setOpenEdit] = useState(false);

  async function handleDelete() {
    try {
      await api.delete(`/financas/${deleteTarget.id}`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir finança');
    }
  }

  if (!financas.length)
    return (
      <Card className="p-4 text-center text-slate-500">
        Nenhuma {tipo === 'RENDA' ? 'renda' : 'despesa'} cadastrada.
      </Card>
    );

  return (
    <>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left hidden sm:table-cell">Categoria</th>
              <th className="p-3 text-left hidden md:table-cell">Início</th>
              <th className="p-3 text-left hidden md:table-cell">Fim</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {financas.map((f: any) => (
              <tr key={f.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{f.nome}</td>
                <td className="p-3">
                  R$ {Number(f.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 hidden sm:table-cell">
                  {f.categoria?.nome ?? '—'}
                </td>
                <td className="p-3 hidden md:table-cell">
                  {format(new Date(f.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="p-3 hidden md:table-cell">
                  {f.dataFim ? format(new Date(f.dataFim), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                </td>
                <td className="p-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(f);
                      setOpenEdit(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(f)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edição */}
      {selected && (
        <FinancaDialog
          open={openEdit}
          setOpen={setOpenEdit}
          tipo={tipo}
          onSave={() => {
            setSelected(null);
            onRefresh();
          }}
          initialData={selected}
        />
      )}

      {/* Modal de exclusão */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Excluir {tipo === 'RENDA' ? 'renda' : 'despesa'}</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Tem certeza que deseja excluir <strong>{deleteTarget.nome}</strong>?
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
