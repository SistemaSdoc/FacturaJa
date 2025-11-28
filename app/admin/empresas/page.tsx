'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainAdmin from '../../components/MainAdmin';

interface Empresa {
  id: number;
  nome: string;
  status: 'Ativa' | 'Inativa';
  email: string;
  telefone: string;
}

export default function AdminEmpresasPage() {
  const router = useRouter(); // <- importante!
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Ativa' | 'Inativa'>('Todos');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEmpresas([
        { id: 1, nome: 'Empresa A', status: 'Ativa', email: 'a@email.com', telefone: '912345678' },
        { id: 2, nome: 'Empresa B', status: 'Inativa', email: 'b@email.com', telefone: '912345679' },
        { id: 3, nome: 'Empresa C', status: 'Ativa', email: 'c@email.com', telefone: '912345680' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = empresas.filter(e =>
    (filterStatus === 'Todos' || e.status === filterStatus) &&
    (e.nome.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <p className="p-6 text-center">Carregando empresas...</p>;

  return (
    <MainAdmin>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#123859] mb-6">Empresas</h1>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Procurar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded flex-1"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="Todos">Todos</option>
            <option value="Ativa">Ativa</option>
            <option value="Inativa">Inativa</option>
          </select>
          <button className="bg-[#F9941F] text-white px-4 py-2 rounded hover:brightness-95">Nova Empresa</button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full border-collapse">
            <thead className="bg-[#E5E5E5]">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Telefone</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{e.id}</td>
                  <td className="p-2 font-medium text-[#123859]">{e.nome}</td>
                  <td className="p-2">{e.email}</td>
                  <td className="p-2">{e.telefone}</td>
                  <td className="p-2">{e.status}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => router.push(`/admin/empresas/${e.id}`)}
                    >
                      Ver
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => alert(`Deletar ${e.nome}`)}
                    >
                      Deletar
                    </button>
                    <button
                      className="text-green-500 hover:underline"
                      onClick={() => alert(`${e.status === 'Ativa' ? 'Desativar' : 'Ativar'} ${e.nome}`)}
                    >
                      {e.status === 'Ativa' ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">Nenhuma empresa encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainAdmin>
  );
}
