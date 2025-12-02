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
  const [mounted, setMounted] = useState(false);

  const [clientAvatar, setClientAvatar] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const avatar = localStorage.getItem('clientAvatar') || '';
      if (avatar) setClientAvatar(avatar);
    } catch {}
  }, []);

  // Simula carregamento de dados
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setCliente({
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '912345678',
      });
      setFaturas([
        {
          id: 1,
          numero: '001',
          data: '2025-11-01',
          vencimento: '2025-11-10',
          total: 120,
          status: 'Pendente',
          items: [
            { id: 1, descricao: 'Produto A', quantidade: 2, precoUnitario: 30, impostoPercent: 0 },
          ],
        },
        {
          id: 2,
          numero: '002',
          data: '2025-11-03',
          vencimento: '2025-11-12',
          total: 300,
          status: 'Pago',
          items: [
            { id: 1, descricao: 'Serviço X', quantidade: 1, precoUnitario: 300, impostoPercent: 0 },
          ],
        },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!mounted) return null;
  if (loading) return <p className="p-6 text-center text-primary dark:text-primary">Carregando...</p>;
  if (!cliente) return <p className="p-6 text-center text-red-500 dark:text-red-400">Cliente não encontrado.</p>;

  return (
    <MainCliente>
      {/* PERFIL DO CLIENTE */}
      <div className="bg-surface dark:bg-surface shadow rounded p-6 mb-6 flex flex-col items-center transition-colors duration-300">
        <img
          src={clientAvatar || '/images/default-avatar.png'}
          alt="Avatar do Cliente"
          className="w-24 h-24 rounded-full object-cover border-4 border-accent dark:border-accent transition-all duration-200 hover:scale-105 hover:border-accent mb-4"
        />
        <h1 className="text-2xl font-bold text-accent dark:text-accent mb-2">Perfil do Cliente</h1>
        <p className="text-primary dark:text-primary"><strong>Nome:</strong> {cliente.nome}</p>
        <p className="text-primary dark:text-primary"><strong>Email:</strong> {cliente.email}</p>
        <p className="text-primary dark:text-primary"><strong>Telefone:</strong> {cliente.telefone}</p>
      </div>

      {/* Faturas */}
      <div className="bg-surface dark:bg-surface shadow rounded p-6 transition-colors duration-300">
        <h2 className="text-xl font-bold text-accent dark:text-accent mb-4">Minhas Faturas</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface dark:bg-surface">
              <tr>
                <th className="p-2 text-left text-primary dark:text-primary">Número</th>
                <th className="p-2 text-left text-primary dark:text-primary">Data</th>
                <th className="p-2 text-left text-primary dark:text-primary">Vencimento</th>
                <th className="p-2 text-left text-primary dark:text-primary">Total</th>
                <th className="p-2 text-left text-primary dark:text-primary">Status</th>
                <th className="p-2 text-left text-primary dark:text-primary">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map(f => (
                <tr key={f.id} className="border-t hover:bg-surface dark:hover:bg-surface transition-colors duration-300">
                  <td className="p-2 font-medium text-primary dark:text-primary">{f.numero}</td>
                  <td className="p-2 text-primary dark:text-primary">{f.data}</td>
                  <td className="p-2 text-primary dark:text-primary">{f.vencimento}</td>
                  <td className="p-2 text-primary dark:text-primary">€ {f.total.toFixed(2)}</td>
                  <td className={`p-2 font-semibold ${f.status === 'Pago' ? 'text-green-500' : f.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {f.status}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => router.push(`/cliente/invoices/view/${f.id}`)}
                      className="text-[#D9961A]"
                    >
                      Ver
                    </button>
                    {f.status === 'Pendente' && (
                      <button
                        onClick={() => router.push(`/cliente/invoices/pay/${f.id}`)}
                        className="text-[#D9961A]"
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {faturas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">Nenhuma fatura encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainCliente>
  );
}
