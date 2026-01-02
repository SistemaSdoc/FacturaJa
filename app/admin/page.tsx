'use client';
import React, { useEffect, useState } from 'react';
import MainAdmin from '../components/MainAdmin';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface Overview {
  totalEmpresas: number;
  totalFaturas: number;
  totalErros: number;
  alertas: string[];
  vendasDiarias: { data: string; total: number }[];
  empresasRecentes: { id: number; nome: string; status: string }[];
  faturasStatus: { status: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState<'7' | '15' | '30'>('7');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOverview({
        totalEmpresas: 12,
        totalFaturas: 150,
        totalErros: 3,
        alertas: ['Erro no processamento de fatura 102', 'Backup não realizado hoje'],
        vendasDiarias: [
          { data: '01/11', total: 1200 },
          { data: '02/11', total: 950 },
          { data: '03/11', total: 1340 },
          { data: '04/11', total: 1100 },
          { data: '05/11', total: 900 },
          { data: '06/11', total: 1500 },
        ],
        empresasRecentes: [
          { id: 1, nome: 'Empresa A', status: 'Ativa' },
          { id: 2, nome: 'Empresa B', status: 'Inativa' },
          { id: 3, nome: 'Empresa C', status: 'Ativa' },
        ],
        faturasStatus: [
          { status: 'Pago', count: 80 },
          { status: 'Pendente', count: 50 },
          { status: 'Cancelada', count: 20 },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <p className="p-6 text-center text-[var(--primary)]">Carregando dashboard...</p>;
  if (!overview) return <p className="p-6 text-center text-red-500">Não foi possível carregar o dashboard.</p>;

  const COLORS = ['var(--primary)', 'var(--accent)', 'var(--surface)'];

  const statusColor = (status: string) =>
    status === 'Ativa' ? 'text-green-600' :
    status === 'Inativa' ? 'text-red-600' :
    'text-[var(--primary)]/70';

  const totalVendas = overview.vendasDiarias.reduce((sum, v) => sum + v.total, 0);
  const mediaVendas = (totalVendas / overview.vendasDiarias.length).toFixed(2);
  const crescimento = overview.vendasDiarias.length > 1
    ? overview.vendasDiarias[overview.vendasDiarias.length - 1].total - overview.vendasDiarias[overview.vendasDiarias.length - 2].total
    : 0;

  return (
    <MainAdmin>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Dashboard</h1>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[var(--primary)]/70 font-semibold">Período:</span>
          {['7', '15', '30'].map(d => (
            <button
              key={d}
              onClick={() => setFiltroPeriodo(d as '7' | '15' | '30')}
              className={`px-4 py-1 rounded ${
                filtroPeriodo === d ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] text-[var(--primary)]'
              } transition-colors duration-200`}
            >
              Últimos {d} dias
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[var(--surface)] hover:scale-105 transition-transform shadow-sm">
            <CardContent>
              <p className="text-[var(--primary)]/70">Total Empresas</p>
              <p className="text-xl font-bold">{overview.totalEmpresas}</p>
            </CardContent>
          </Card>
          <Card className="bg-[var(--surface)] hover:scale-105 transition-transform shadow-sm">
            <CardContent>
              <p className="text-[var(--primary)]/70">Total Faturas</p>
              <p className="text-xl font-bold">{overview.totalFaturas}</p>
            </CardContent>
          </Card>
          <Card className="bg-[var(--surface)] hover:scale-105 transition-transform shadow-sm">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-[var(--primary)]/70">Vendas Total</p>
                <p className="text-xl font-bold">€ {totalVendas}</p>
              </div>
              <div className="flex items-center gap-1">
                {crescimento >= 0 ? <ArrowUp className="text-green-600"/> : <ArrowDown className="text-red-600"/>}
                <span className={`font-bold ${crescimento >=0 ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(crescimento)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[var(--surface)] hover:scale-105 transition-transform shadow-sm">
            <CardContent className="flex items-center gap-2">
              <AlertCircle className="text-[var(--accent)]" />
              <div>
                <p className="text-[var(--primary)]/70">Alertas</p>
                <p className="text-xl font-bold">{overview.alertas.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendas Diárias */}
          <Card className="bg-[var(--surface)]">
            <CardHeader><CardTitle>Vendas Diárias</CardTitle></CardHeader>
            <CardContent className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.vendasDiarias.slice(-Number(filtroPeriodo))}>
                  <XAxis dataKey="data" stroke="var(--primary)"/>
                  <YAxis stroke="var(--primary)"/>
                  <Tooltip />
                  <Bar dataKey="total" fill="var(--primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="absolute top-4 right-4 bg-[var(--surface)] p-2 rounded shadow text-sm font-bold">
                Média: € {mediaVendas}
              </div>
            </CardContent>
          </Card>

          {/* Status Faturas */}
          <Card className="bg-[var(--surface)]">
            <CardHeader><CardTitle>Status das Faturas</CardTitle></CardHeader>
            <CardContent className="h-64 flex justify-center items-center relative">
              <ResponsiveContainer width="80%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.faturasStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {overview.faturasStatus.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute bottom-4 text-sm text-[var(--primary)]/70">
                Total Faturas: {overview.totalFaturas}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empresas Recentes */}
        <Card className="bg-[var(--surface)]">
          <CardHeader><CardTitle>Empresas Recentes</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[var(--primary)]">ID</TableHead>
                  <TableHead className="text-[var(--primary)]">Nome</TableHead>
                  <TableHead className="text-[var(--primary)]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.empresasRecentes.map((e) => (
                  <TableRow key={e.id} className="hover:bg-[var(--accent)]/10 transition-colors">
                    <TableCell className="text-[var(--primary)]">{e.id}</TableCell>
                    <TableCell className="text-[var(--primary)]">{e.nome}</TableCell>
                    <TableCell className={statusColor(e.status)}>{e.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainAdmin>
  );
}
