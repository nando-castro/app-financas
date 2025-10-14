import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';

export function FinancasTable({ financas, tipo, onRefresh }: any) {
  if (!financas.length)
    return (
      <Card className="p-4 text-center text-slate-500">
        Nenhuma {tipo === 'RENDA' ? 'renda' : 'despesa'} cadastrada.
      </Card>
    );

  return (
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
                <Button variant="outline" size="sm">
                  <Pencil size={16} />
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
