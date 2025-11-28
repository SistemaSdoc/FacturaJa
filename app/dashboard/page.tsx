'use client';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MainLayout from '../components/MainLayout';

interface KPI {
  vendasHoje: number;
  faturasPendentes: number;
  caixaDoDia: number;
  receitaSemana: { dia: string, receita: number }[];
}

interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: string;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Usuário não autenticado');

        const overviewRes = await fetch('/api/companies/me/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!overviewRes.ok) throw new Error('Erro ao carregar KPIs');
        const overviewData = await overviewRes.json();

        const faturasRes = await fetch('/api/invoices?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!faturasRes.ok) throw new Error('Erro ao carregar faturas');
        const faturasData = await faturasRes.json();

        setKpis(overviewData);
        setFaturas(faturasData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredFaturas = faturas.filter(f =>
    f.numero.toLowerCase().includes(search.toLowerCase()) ||
    f.cliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#123859]">Dashboard</h1>
        <input
          type="text"
          placeholder="Pesquisar faturas..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      {loading && <p>Carregando dados...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && kpis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Vendas Hoje</p>
              <p className="text-xl font-bold text-[#123859]">€ {kpis.vendasHoje.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Faturas Pendentes</p>
              <p className="text-xl font-bold text-[#123859]">{kpis.faturasPendentes}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Caixa do Dia</p>
              <p className="text-xl font-bold text-[#123859]">€ {kpis.caixaDoDia.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Receita da Semana</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kpis.receitaSemana}>
                <XAxis dataKey="dia" stroke="#123859"/>
                <YAxis stroke="#123859"/>
                <Tooltip />
                <Line type="monotone" dataKey="receita" stroke="#F9941F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-[#123859] mb-2">Faturas Recentes</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E5E5E5] text-left">
                  <th className="p-2">Número</th>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Data</th>
                  <th className="p-2">Vencimento</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaturas.map(f=>(<tr key={f.id} className="border-t">
                  <td className="p-2 text-[#123859] font-medium">{f.numero}</td>
                  <td className="p-2">{f.cliente}</td>
                  <td className="p-2">{f.data}</td>
                  <td className="p-2">{f.vencimento}</td>
                  <td className="p-2">€ {f.total.toFixed(2)}</td>
                  <td className={`p-2 font-semibold ${f.status==='Pago'?'text-green-500':'text-red-500'}`}>{f.status}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MainLayout>
  );
}
