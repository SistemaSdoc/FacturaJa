'use client';
import React, { useEffect, useState } from 'react';
import MainAdmin from '../../components/MainAdmin'; // ajuste o caminho conforme a pasta

interface Overview {
  totalEmpresas: number;
  totalFaturas: number;
  totalErros: number;
  alertas: string[];
  vendasDiarias: { data: string; total: number }[];
  empresasRecentes: { id: number; nome: string; status: string }[];
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock: substituir por fetch GET /api/admin/overview
    setLoading(true);
    setTimeout(() => {
      setOverview({
        totalEmpresas: 12,
        totalFaturas: 150,
        totalErros: 3,
        alertas: ['Erro no processamento de fatura 102', 'Backup não realizado hoje'],
        vendasDiarias: [
          { data: '2025-11-01', total: 1200 },
          { data: '2025-11-02', total: 950 },
          { data: '2025-11-03', total: 1340 },
        ],
        empresasRecentes: [
          { id: 1, nome: 'Empresa A', status: 'Ativa' },
          { id: 2, nome: 'Empresa B', status: 'Inativa' },
          { id: 3, nome: 'Empresa C', status: 'Ativa' },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <p className="p-6 text-center">Carregando dashboard...</p>;
  if (!overview) return <p className="p-6 text-center text-red-500">Não foi possível carregar o dashboard.</p>;

  return (
    <MainAdmin>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#123859] mb-6">Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Total Empresas</p>
            <p className="text-xl font-bold">{overview.totalEmpresas}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Total Faturas</p>
            <p className="text-xl font-bold">{overview.totalFaturas}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Erros</p>
            <p className="text-xl font-bold text-red-500">{overview.totalErros}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Alertas</p>
            <p className="text-xl font-bold">{overview.alertas.length}</p>
          </div>
        </div>

        {/* Gráfico vendas diárias */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-bold mb-4">Vendas Diárias</h2>
          <div className="grid grid-cols-3 gap-2">
            {overview.vendasDiarias.map((v) => (
              <div key={v.data} className="bg-[#E5E5E5] p-2 rounded text-center">
                <p className="text-sm">{v.data}</p>
                <p className="font-bold">€ {v.total}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Empresas recentes */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Empresas Recentes</h2>
          <table className="w-full border-collapse">
            <thead className="bg-[#E5E5E5]">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {overview.empresasRecentes.map((e) => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{e.id}</td>
                  <td className="p-2">{e.nome}</td>
                  <td className="p-2">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainAdmin>
  );
}
