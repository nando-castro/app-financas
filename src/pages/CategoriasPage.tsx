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

type TipoCategoria = 'RENDA' | 'DESPESA';
type FiltroCategoria = 'TODAS' | TipoCategoria;

interface Categoria {
  id: number;
  nome: string;
  tipo: TipoCategoria;
  criadoEm: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoCategoria>('DESPESA');
  const [filtroTipo, setFiltroTipo] = useState<FiltroCategoria>('TODAS');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null);

  async function buscarCategorias(tipoFiltro: FiltroCategoria = filtroTipo) {
    const params = tipoFiltro !== 'TODAS' ? { tipo: tipoFiltro } : {};

    const { data } = await api.get('/categorias', { params });
    setCategorias(data);
  }

  useEffect(() => {
    buscarCategorias(filtroTipo);
  }, [filtroTipo]);

  function abrirModalNovaCategoria() {
    setEditing(null);
    setNome('');
    setTipo('DESPESA');
    setOpen(true);
  }

  function abrirModalEditarCategoria(categoria: Categoria) {
    setEditing(categoria);
    setNome(categoria.nome);
    setTipo(categoria.tipo);
    setOpen(true);
  }

  async function salvarCategoria() {
    try {
      if (!nome.trim()) {
        alert('Informe o nome da categoria.');
        return;
      }

      setLoading(true);

      const payload = {
        nome: nome.trim(),
        tipo,
      };

      if (editing) {
        await api.put(`/categorias/${editing.id}`, payload);
      } else {
        await api.post('/categorias', payload);
      }

      setOpen(false);
      setNome('');
      setTipo('DESPESA');
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
    if (!deleteTarget) return;

    try {
      await api.delete(`/categorias/${deleteTarget.id}`);
      setDeleteTarget(null);
      buscarCategorias();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir categoria');
    }
  }

  function getTipoLabel(tipo: TipoCategoria) {
    return tipo === 'RENDA' ? 'Renda' : 'Despesa';
  }

  function getTipoBadgeClass(tipo: TipoCategoria) {
    return tipo === 'RENDA'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Categorias</h1>

        <Button
          onClick={abrirModalNovaCategoria}
          className="flex items-center gap-2"
        >
          <PlusCircle size={18} /> Nova Categoria
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={filtroTipo === 'TODAS' ? 'default' : 'outline'}
            onClick={() => setFiltroTipo('TODAS')}
          >
            Todas
          </Button>

          <Button
            type="button"
            variant={filtroTipo === 'RENDA' ? 'default' : 'outline'}
            onClick={() => setFiltroTipo('RENDA')}
          >
            Rendas
          </Button>

          <Button
            type="button"
            variant={filtroTipo === 'DESPESA' ? 'default' : 'outline'}
            onClick={() => setFiltroTipo('DESPESA')}
          >
            Despesas
          </Button>
        </div>
      </Card>

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
                <th className="p-3 text-left">Tipo</th>
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

                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getTipoBadgeClass(
                        c.tipo,
                      )}`}
                    >
                      {getTipoLabel(c.tipo)}
                    </span>
                  </td>

                  <td className="p-3 hidden sm:table-cell">
                    {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                  </td>

                  <td className="p-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModalEditarCategoria(c)}
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

            <div>
              <Label>Tipo</Label>

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoCategoria)}
                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="DESPESA">Despesa</option>
                <option value="RENDA">Renda</option>
              </select>
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

            <p className="text-sm text-slate-500">
              Tipo:{' '}
              <strong>{getTipoLabel(deleteTarget.tipo)}</strong>
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