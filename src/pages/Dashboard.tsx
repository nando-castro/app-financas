import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    api.get('/financas/estatisticas/mensal').then((res) => setDados(res.data));
  }, []);

  if (!dados) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader><CardTitle>Rendas</CardTitle></CardHeader>
        <CardContent>R$ {dados.totalRendas.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Despesas</CardTitle></CardHeader>
        <CardContent>R$ {dados.totalDespesas.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Saldo</CardTitle></CardHeader>
        <CardContent>R$ {dados.saldo.toFixed(2)}</CardContent>
      </Card>
    </div>
  );
}
