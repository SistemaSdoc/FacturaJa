'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainCliente from '../../components/MainCliente'; // ajuste o caminho conforme sua pasta

type Status = 'Pago' | 'Pendente' | 'Cancelada';

interface LineItem {
  id: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  impostoPercent: number;
}

interface Fatura {
  id: number;
  numero: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  items: LineItem[];
}

interface Cliente {
  nome: string;
  email: string;
  telefone: string;
}

export default function ClienteContaPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCliente({
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '912345678',
      });
      setFaturas([
        { id: 1, numero: '001', data: '2025-11-01', vencimento: '2025-11-10', total: 120, status: 'Pendente', items: [{ id: 1, descricao: 'Produto A', quantidade: 2, precoUnitario: 30, impostoPercent: 0 }] },
        { id: 2, numero: '002', data: '2025-11-03', vencimento: '2025-11-12', total: 300, status: 'Pago', items: [{ id: 1, descricao: 'Serviço X', quantidade: 1, precoUnitario: 300, impostoPercent: 0 }] },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (!cliente) return <p className="p-6 text-center text-red-500">Cliente não encontrado.</p>;

  return (
    <MainCliente>
      <div className="bg-white shadow rounded p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Perfil do Cliente</h1>
        <p><strong>Nome:</strong> {cliente.nome}</p>
        <p><strong>Email:</strong> {cliente.email}</p>
        <p><strong>Telefone:</strong> {cliente.telefone}</p>
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:brightness-95">
          Logout
        </button>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-bold text-[#123859] mb-4">Minhas Faturas</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#E5E5E5]">
              <tr>
                <th className="p-2 text-left">Número</th>
                <th className="p-2 text-left">Data</th>
                <th className="p-2 text-left">Vencimento</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium text-[#123859]">{f.numero}</td>
                  <td className="p-2">{f.data}</td>
                  <td className="p-2">{f.vencimento}</td>
                  <td className="p-2">€ {f.total.toFixed(2)}</td>
                  <td className={`p-2 font-semibold ${f.status === 'Pago' ? 'text-green-500' : f.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{f.status}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => router.push(`/cliente/invoices/view/${f.id}`)}
                      className="text-blue-500 hover:underline"
                    >
                      Ver
                    </button>
                    {f.status === 'Pendente' && (
                      <button
                        onClick={() => router.push(`/cliente/invoices/pay/${f.id}`)}
                        className="text-purple-500 hover:underline"
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {faturas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">Nenhuma fatura encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainCliente>
  );
}
