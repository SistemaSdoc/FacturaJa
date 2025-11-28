'use client';
import React, { useEffect, useState } from 'react';
import MainAdmin from '../../components/MainAdmin';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'Admin' | 'Usuário' | 'Financeiro';
  empresa: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'Todos' | 'Admin' | 'Usuário' | 'Financeiro'>('Todos');
  const [filterEmpresa, setFilterEmpresa] = useState<'Todos' | string>('Todos');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsuarios([
        { id: 1, nome: 'João Silva', email: 'joao@email.com', role: 'Admin', empresa: 'Empresa A' },
        { id: 2, nome: 'Maria Costa', email: 'maria@email.com', role: 'Usuário', empresa: 'Empresa B' },
        { id: 3, nome: 'Carlos Pereira', email: 'carlos@email.com', role: 'Financeiro', empresa: 'Empresa A' },
        { id: 4, nome: 'Ana Lima', email: 'ana@email.com', role: 'Usuário', empresa: 'Empresa C' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const empresas = Array.from(new Set(usuarios.map(u => u.empresa)));

  const filtered = usuarios.filter(u =>
    (filterRole === 'Todos' || u.role === filterRole) &&
    (filterEmpresa === 'Todos' || u.empresa === filterEmpresa) &&
    (u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRoleChange = (id: number, newRole: Usuario['role']) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const handleDelete = (id: number) => {
    if(confirm('Tem certeza que deseja deletar este usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  };

  if (loading) return <p className="p-6 text-center">Carregando usuários...</p>;

  return (
    <MainAdmin>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#123859] mb-6">Usuários</h1>

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
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="Todos">Todos os Roles</option>
            <option value="Admin">Admin</option>
            <option value="Usuário">Usuário</option>
            <option value="Financeiro">Financeiro</option>
          </select>
          <select
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="Todos">Todas as Empresas</option>
            {empresas.map(emp => <option key={emp} value={emp}>{emp}</option>)}
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full border-collapse">
            <thead className="bg-[#E5E5E5]">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Empresa</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2 font-medium text-[#123859]">{u.nome}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Usuario['role'])}
                      className="p-1 border rounded"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Usuário">Usuário</option>
                      <option value="Financeiro">Financeiro</option>
                    </select>
                  </td>
                  <td className="p-2">{u.empresa}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/usuarios/${u.id}`)}
                      className="text-blue-500 hover:underline"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:underline"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainAdmin>
  );
}
