'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { getUsers, deleteUser, getUser } from '../../services/axios';

interface TenantUser {
  id: string; // UUID
  name: string;
  email?: string;
  telefone?: string;
  role?: string;
  status?: 'Ativo' | 'Inativo';
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; action: string; id?: string }>({ open: false, action: '', id: undefined });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ----------------- INIT AUTENTICAÇÃO -----------------
  const init = useCallback(async () => {
    setLoading(true);
    try {
      await getUser();        // valida usuário logado
      await fetchUsers();     // carrega usuários após autenticação
    } catch {
      router.push('/login');  // redireciona se não autenticado
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    init();
  }, [init]);

  // ----------------- FETCH USERS -----------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let data = await getUsers();
      if (search) data = data.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
      if (filterStatus) data = data.filter(u => u.status === filterStatus);
      setUsers(data);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  // ----------------- DEBOUNCE -----------------
  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  // ----------------- SELEÇÃO -----------------
  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // ----------------- AÇÕES -----------------
  const handleAction = async (id: string | string[], action: string) => {
    if (action !== 'delete') return;
    setLoading(true);
    try {
      if (Array.isArray(id)) {
        await Promise.all(id.map(uid => deleteUser(uid)));
      } else {
        await deleteUser(id);
      }
      setSelected([]);
      await fetchUsers();
      setModal({ open: false, action: '' });
    } catch (error: any) {
      alert(error.message || 'Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  const totalAtivos = users.filter(u => u.status === 'Ativo').length;
  const totalInativos = users.filter(u => u.status === 'Inativo').length;

  return (
    <MainLayout>
      {/* Título + Novo Usuário */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#123859]">Usuários</h1>
        <button
          onClick={() => router.push('/dashboard/Users/novo-user')}
          className="bg-[#F9941F] text-white px-4 py-2 rounded hover:brightness-95"
        >
          + Novo Usuário
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Total de Usuários</p>
          <p className="text-2xl font-bold text-[#123859]">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Ativos</p>
          <p className="text-2xl font-bold text-green-500">{totalAtivos}</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Inativos</p>
          <p className="text-2xl font-bold text-red-500">{totalInativos}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-[#F9941F]"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full md:w-1/5 focus:outline-none focus:ring-2 focus:ring-[#F9941F]"
        >
          <option value="">Todos os status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
        {selected.length > 0 && (
          <button
            onClick={() => setModal({ open: true, action: 'delete' })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Apagar selecionados ({selected.length})
          </button>
        )}
      </div>

      {/* Loading ou Erro */}
      {loading && <div className="text-center py-4 text-[#123859] font-semibold">Carregando...</div>}
      {errorMsg && !loading && <div className="text-center py-4 text-red-500 font-semibold">{errorMsg}</div>}

      {/* Tabela de Usuários */}
      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow rounded">
            <thead className="bg-[#E5E5E5]">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.length === users.length && users.length > 0}
                    onChange={e => setSelected(e.target.checked ? users.map(u => u.id) : [])}
                  />
                </th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Telefone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} />
                  </td>
                  <td className="p-3 font-medium text-[#123859]">{u.name}</td>
                  <td className="p-3">{u.email || '-'}</td>
                  <td className="p-3">{u.telefone || '-'}</td>
                  <td className={`p-3 font-semibold ${u.status === 'Ativo' ? 'text-green-500' : 'text-red-500'}`}>
                    {u.status || '-'}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button className="text-[#123859]" onClick={() => router.push(`/dashboard/Users/${u.id}/ver`)}>Ver</button>
                    <button className="text-[#F9941F]" onClick={() => router.push(`/dashboard/Users/${u.id}/editar`)}>Editar</button>
                    <button className="text-red-500" onClick={() => setModal({ open: true, action: 'delete', id: u.id })}>Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmação */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold text-[#123859] mb-4">Confirmar ação</h2>
            <p className="mb-4">
              Tem certeza que deseja {modal.action === 'delete' ? 'apagar' : modal.action}{' '}
              {modal.id ? 'este usuário?' : 'os usuários selecionados?'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal({ open: false, action: '' })}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction(modal.id ?? selected, modal.action)}
                className="px-4 py-2 bg-[#F9941F] text-white rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
