'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  status: 'Ativo' | 'Inativo';
}

export default function ClientesPage() {
  const router = useRouter();

  // Estados principais
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; action: string; id?: number }>({ open: false, action: '', id: undefined });

  // Dados simulados
  const mockClientes: Cliente[] = [
    { id: 1, nome: 'João Silva', email: 'joao@gmail.com', telefone: '912345678', empresa: 'Empresa A', status: 'Ativo' },
    { id: 2, nome: 'Maria Santos', email: 'maria@gmail.com', telefone: '923456789', empresa: 'Empresa B', status: 'Ativo' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@gmail.com', telefone: '934567890', empresa: 'Empresa C', status: 'Inativo' },
  ];

  // Função para buscar e filtrar clientes
  const fetchClientes = () => {
    setLoading(true);
    let data = mockClientes;
    if (search) data = data.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) data = data.filter(c => c.status === filterStatus);
    setClientes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, [search, filterStatus]);

  // Seleção de múltiplos clientes
  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Ação de apagar/editar clientes
  const handleAction = (id: number | number[], action: string) => {
    alert(`Ação "${action}" executada em ${Array.isArray(id) ? 'vários clientes' : 'cliente ' + id}`);
    setSelected([]);
    setModal({ open: false, action: '' });
  };

  const totalAtivos = mockClientes.filter(c => c.status === 'Ativo').length;
  const totalInativos = mockClientes.filter(c => c.status === 'Inativo').length;

  return (
    <MainLayout>
      {/* Botão Novo Cliente */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/dashboard/Clientes/novo-cliente')}
          className="bg-[#F9941F] text-white px-4 py-2 rounded hover:brightness-95"
        >
          + Novo Cliente
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Total de Clientes</p>
          <p className="text-2xl font-bold text-[#123859]">{mockClientes.length}</p>
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

      {/* Tabela de Clientes */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow rounded">
          <thead className="bg-[#E5E5E5]">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selected.length === clientes.length && clientes.length > 0}
                  onChange={e => setSelected(e.target.checked ? clientes.map(c => c.id) : [])}
                />
              </th>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Telefone</th>
              <th className="p-3 text-left">Empresa</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                </td>
                <td className="p-3 font-medium text-[#123859]">{c.nome}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.telefone}</td>
                <td className="p-3">{c.empresa}</td>
                <td className={`p-3 font-semibold ${c.status === 'Ativo' ? 'text-green-500' : 'text-red-500'}`}>{c.status}</td>
                <td className="p-3 flex gap-2">
                  <button className="text-[#123859]" onClick={() => router.push(`/dashboard/Clientes/${c.id}/ver`)}>Ver</button>
                  <button className="text-[#F9941F]" onClick={() => router.push(`/dashboard/Clientes/${c.id}/editar`)}>Editar</button>
                  <button className="text-red-500" onClick={() => router.push(`/dashboard/Clientes/${c.id}/apagar`)}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold text-[#123859] mb-4">Confirmar ação</h2>
            <p className="mb-4">
              Tem certeza que deseja {modal.action} {modal.id ? 'este cliente?' : 'os clientes selecionados?'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal({ open: false, action: '' })} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={() => handleAction(modal.id ?? selected, modal.action)} className="px-4 py-2 bg-[#F9941F] text-white rounded">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
