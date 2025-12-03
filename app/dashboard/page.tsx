'use client';
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import MainEmpresa from '../components/MainLayout';


interface KPI {
  vendasHoje: number;
  faturasPendentes: number;
  caixaDoDia: number;
  receitaSemana: { dia: string; receita: number }[];
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

interface Categoria {
  categoria: string;
  vendas: number;
}

interface Pagamentos {
  status: string;
  valor: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [vendasCategorias, setVendasCategorias] = useState<Categoria[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamentos[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Dados simulados
    const mockKPIs: KPI = {
      vendasHoje: 1250.75,
      faturasPendentes: 4,
      caixaDoDia: 980.5,
      receitaSemana: [
        { dia: 'Seg', receita: 300 },
        { dia: 'Ter', receita: 450 },
        { dia: 'Qua', receita: 500 },
        { dia: 'Qui', receita: 700 },
        { dia: 'Sex', receita: 650 },
        { dia: 'Sáb', receita: 400 },
        { dia: 'Dom', receita: 550 },
      ],
    };

    const mockFaturas: Fatura[] = [
      { id: 1, numero: 'FAT-001', cliente: 'João Silva', data: '2025-11-25', vencimento: '2025-11-30', total: 250.5, status: 'Pago' },
      { id: 2, numero: 'FAT-002', cliente: 'Maria Oliveira', data: '2025-11-24', vencimento: '2025-11-29', total: 180.75, status: 'Pendente' },
      { id: 3, numero: 'FAT-003', cliente: 'Carlos Mendes', data: '2025-11-23', vencimento: '2025-11-28', total: 320.0, status: 'Pago' },
      { id: 4, numero: 'FAT-004', cliente: 'Ana Costa', data: '2025-11-22', vencimento: '2025-11-27', total: 150.0, status: 'Pendente' },
      { id: 5, numero: 'FAT-005', cliente: 'Luís Pereira', data: '2025-11-21', vencimento: '2025-11-26', total: 400.25, status: 'Pago' },
    ];

    const mockVendasCategorias: Categoria[] = [
      { categoria: 'Medicamentos', vendas: 1200 },
      { categoria: 'Cosméticos', vendas: 800 },
      { categoria: 'Suplementos', vendas: 400 },
      { categoria: 'Outros', vendas: 250 },
    ];

    const mockPagamentos: Pagamentos[] = [
      { status: 'Pago', valor: 1020 },
      { status: 'Pendente', valor: 350 },
    ];

    setTimeout(() => {
      setKpis(mockKPIs);
      setFaturas(mockFaturas);
      setVendasCategorias(mockVendasCategorias);
      setPagamentos(mockPagamentos);
      setLoading(false);
    }, 500);
  }, []);

  if (!isMounted) return null;

  const filteredFaturas = faturas.filter(
    (f) =>
      f.numero.toLowerCase().includes(search.toLowerCase()) ||
      f.cliente.toLowerCase().includes(search.toLowerCase())
  );

  const pieColors = ['#4ade80', '#f87171'];

  return (
    <MainEmpresa>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#123859]">Dashboard</h1>
        <input
          type="text"
          placeholder="Pesquisar faturas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />
      </div>

      {loading && <p>Carregando dados...</p>}

      {!loading && kpis && (
        <>
          {/* KPIs */}
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

          {/* Receita da Semana */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Receita da Semana</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kpis.receitaSemana}>
                <XAxis dataKey="dia" stroke="#123859" />
                <YAxis stroke="#123859" />
                <Tooltip />
                <Line type="monotone" dataKey="receita" stroke="#F9941F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vendas por Categoria */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Vendas por Categoria</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vendasCategorias}>
                <XAxis dataKey="categoria" stroke="#123859" />
                <YAxis stroke="#123859" />
                <Tooltip />
                <Bar dataKey="vendas" fill="#F9941F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pagamentos */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-semibold text-[#123859] mb-2">Pagamentos</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pagamentos}
                  dataKey="valor"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {pagamentos.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Faturas Recentes */}
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
                {filteredFaturas.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="p-2 text-[#123859] font-medium">{f.numero}</td>
                    <td className="p-2">{f.cliente}</td>
                    <td className="p-2">{f.data}</td>
                    <td className="p-2">{f.vencimento}</td>
                    <td className="p-2">€ {f.total.toFixed(2)}</td>
                    <td className={`p-2 font-semibold ${f.status === 'Pago' ? 'text-green-500' : 'text-red-500'}`}>
                      {f.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MainEmpresa>
  );
}
