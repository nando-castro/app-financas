import { FinancaDialog } from '@/components/financas/FinancaDialog';
import { FinancasTable } from '@/components/financas/FinancasTable';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Filter, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function FinancasPage() {
  const [tipo, setTipo] = useState<'RENDA' | 'DESPESA'>('RENDA');
  const [financas, setFinancas] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  async function buscarFinancas() {
    const { data } = await api.get(`/financas/tipo/${tipo}`, {
      params: { mes, ano },
    });
    setFinancas(data);
  }

  useEffect(() => {
    buscarFinancas();
  }, [tipo, mes, ano]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Minhas Finanças</h1>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <PlusCircle size={18} /> Nova {tipo === 'RENDA' ? 'Renda' : 'Despesa'}
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="border rounded-md px-3 py-2"
        >
          {meses.map((nome, index) => (
            <option key={index} value={index + 1}>
              {nome}
            </option>
          ))}
        </select>

        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="border rounded-md px-3 py-2"
        >
          {Array.from({ length: 6 }, (_, i) => hoje.getFullYear() - 2 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <Button variant="outline" className="flex items-center gap-2" onClick={buscarFinancas}>
          <Filter size={16} /> Filtrar
        </Button>
      </div>

      {/* Abas de tipo */}
      <Tabs value={tipo} onValueChange={(v: any) => setTipo(v)}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="RENDA" className="w-1/2 md:w-auto">Rendas</TabsTrigger>
          <TabsTrigger value="DESPESA" className="w-1/2 md:w-auto">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="RENDA">
          <FinancasTable financas={financas} tipo="RENDA" onRefresh={buscarFinancas} />
        </TabsContent>

        <TabsContent value="DESPESA">
          <FinancasTable financas={financas} tipo="DESPESA" onRefresh={buscarFinancas} />
        </TabsContent>
      </Tabs>

      <FinancaDialog open={open} setOpen={setOpen} tipo={tipo} onSave={buscarFinancas} />
    </div>
  );
}
