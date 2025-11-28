'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainAdmin from '../../../components/MainAdmin';

interface Empresa {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: 'Ativa' | 'Inativa';
  nif: string;
  regimeFiscal: string;
  series: { id: number; nome: string; ativo: boolean }[];
  usuarios: { id: number; nome: string; email: string; role: string }[];
}

export default function EmpresaDetailPage() {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'fiscal' | 'series' | 'usuarios'>('info');

  useEffect(() => {
    setLoading(true);
    // Mock realista conforme id
    setTimeout(() => {
      setEmpresa({
        id: Number(id),
        nome: `Empresa ${id}`,
        email: `empresa${id}@email.com`,
        telefone: `9123456${id}`,
        status: id === '2' ? 'Inativa' : 'Ativa',
        nif: `12345678${id}`,
        regimeFiscal: 'Simplificado',
        series: [
          { id: 1, nome: `Série A${id}`, ativo: true },
          { id: 2, nome: `Série B${id}`, ativo: false },
        ],
        usuarios: [
          { id: 1, nome: 'João Silva', email: 'joao@email.com', role: 'Admin' },
          { id: 2, nome: 'Maria Costa', email: 'maria@email.com', role: 'Usuário' },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <p className="p-6 text-center">Carregando empresa...</p>;
  if (!empresa) return <p className="p-6 text-center text-red-500">Empresa não encontrada.</p>;

  const handleSave = () => {
    alert(`Dados salvos para ${empresa.nome}`);
  };

  const handleToggleSeries = (serieId: number) => {
    setEmpresa(prev => {
      if (!prev) return prev;
      const updatedSeries = prev.series.map(s => s.id === serieId ? { ...s, ativo: !s.ativo } : s);
      return { ...prev, series: updatedSeries };
    });
  };

  return (
    <MainAdmin>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Empresa {empresa.id} - {empresa.nome}</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['info', 'fiscal', 'series', 'usuarios'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-t ${
                activeTab === tab ? 'bg-[#123859] text-white' : 'bg-[#E5E5E5] text-[#123859]'
              }`}
            >
              {tab === 'info' ? 'Informações' : tab === 'fiscal' ? 'Configuração Fiscal' : tab === 'series' ? 'Séries' : 'Usuários'}
            </button>
          ))}
        </div>

        <div className="bg-white shadow rounded p-6">
          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold">Nome</label>
                <input
                  type="text"
                  value={empresa.nome}
                  onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Email</label>
                <input
                  type="email"
                  value={empresa.email}
                  onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Telefone</label>
                <input
                  type="text"
                  value={empresa.telefone}
                  onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Status</label>
                <select
                  value={empresa.status}
                  onChange={(e) => setEmpresa({ ...empresa, status: e.target.value as any })}
                  className="border p-2 rounded w-full"
                >
                  <option value="Ativa">Ativa</option>
                  <option value="Inativa">Inativa</option>
                </select>
              </div>
              <button onClick={handleSave} className="bg-[#F9941F] text-white px-4 py-2 rounded mt-4 hover:brightness-95">Salvar</button>
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold">NIF</label>
                <input
                  type="text"
                  value={empresa.nif}
                  onChange={(e) => setEmpresa({ ...empresa, nif: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Regime Fiscal</label>
                <input
                  type="text"
                  value={empresa.regimeFiscal}
                  onChange={(e) => setEmpresa({ ...empresa, regimeFiscal: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <button onClick={handleSave} className="bg-[#F9941F] text-white px-4 py-2 rounded mt-4 hover:brightness-95">Salvar</button>
            </div>
          )}

          {activeTab === 'series' && (
            <div>
              <table className="w-full border-collapse">
                <thead className="bg-[#E5E5E5]">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Nome</th>
                    <th className="p-2 text-left">Ativo</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa.series.map(s => (
                    <tr key={s.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{s.id}</td>
                      <td className="p-2">{s.nome}</td>
                      <td className="p-2">{s.ativo ? 'Sim' : 'Não'}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleToggleSeries(s.id)}
                          className="text-blue-500 hover:underline"
                        >
                          {s.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div>
              <table className="w-full border-collapse">
                <thead className="bg-[#E5E5E5]">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Nome</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa.usuarios.map(u => (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{u.id}</td>
                      <td className="p-2">{u.nome}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainAdmin>
  );
}
