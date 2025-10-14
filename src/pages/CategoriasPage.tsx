import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  async function buscarCategorias() {
    const { data } = await api.get('/categorias');
    setCategorias(data);
  }

  useEffect(() => {
    buscarCategorias();
  }, []);

  async function salvarCategoria() {
    try {
      setLoading(true);
      if (editing) {
        await api.put(`/categorias/${editing.id}`, { nome });
      } else {
        await api.post('/categorias', { nome });
      }
      setOpen(false);
      setNome('');
      setEditing(null);
      buscarCategorias();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  }

  async function excluirCategoria() {
    try {
      await api.delete(`/categorias/${deleteTarget.id}`);
      setDeleteTarget(null);
      buscarCategorias();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir categoria');
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Categorias</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setNome('');
            setOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle size={18} /> Nova Categoria
        </Button>
      </div>

      {/* Listagem */}
      {categorias.length === 0 ? (
        <Card className="p-4 text-center text-slate-500">
          Nenhuma categoria cadastrada.
        </Card>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-900">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left hidden sm:table-cell">
                  Criado em
                </th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{c.nome}</td>
                  <td className="p-3 hidden sm:table-cell">
                    {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(c);
                        setNome(c.nome);
                        setOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(c)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar/Editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Alimentação, Salário..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarCategoria} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Exclusão */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Excluir Categoria</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Deseja realmente excluir{' '}
              <strong>{deleteTarget.nome}</strong>?
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={excluirCategoria}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
