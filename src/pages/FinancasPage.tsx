import { FinancaDialog } from '@/components/financas/FinancaDialog';
import { FinancasTable } from '@/components/financas/FinancasTable';
import { Button } from '@/components/ui/button';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function FinancasPage() {
  const [tipo, setTipo] = useState<'RENDA' | 'DESPESA'>('RENDA');
  const [financas, setFinancas] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  async function buscarFinancas() {
    const { data } = await api.get(`/financas/tipo/${tipo}`);
    setFinancas(data);
  }

  useEffect(() => {
    buscarFinancas();
  }, [tipo]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Minhas Finanças</h1>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <PlusCircle size={18} /> Nova {tipo === 'RENDA' ? 'Renda' : 'Despesa'}
        </Button>
      </div>

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
