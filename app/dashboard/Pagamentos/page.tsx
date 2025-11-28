'use client';
import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';

type PaymentMethod = 'Cartão' | 'PIX' | 'Multicaixa' | 'Transferência' | 'Boleto';
type PaymentStatus = 'Conciliado' | 'Pendente' | 'Estornado';

interface Payment {
  id: number;
  reference: string;
  cliente?: string;
  data: string; // yyyy-mm-dd
  metodo: PaymentMethod;
  valor: number;
  status: PaymentStatus;
  invoiceId?: number | null;
  nota?: string;
}

export default function PagamentosPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const initialMock: Payment[] = [
    { id: 1, reference: 'PAY-2025-001', cliente: 'João Silva', data: '2025-11-20', metodo: 'PIX', valor: 150.0, status: 'Pendente', invoiceId: null },
    { id: 2, reference: 'PAY-2025-002', cliente: 'Loja ABC', data: '2025-11-18', metodo: 'Cartão', valor: 320.5, status: 'Conciliado', invoiceId: 2 },
  ];

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) {
        setPayments(initialMock);
        return;
      }
      const res = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao buscar pagamentos');
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : data.items ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro desconhecido');
      setPayments(initialMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (search && !(`${p.reference} ${p.cliente ?? ''} ${p.nota ?? ''}`).toLowerCase().includes(search.toLowerCase())) return false;
      if (methodFilter && p.metodo !== methodFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (startDate && new Date(p.data) < startDate) return false;
      if (endDate && new Date(p.data) > endDate) return false;
      return true;
    });
  }, [payments, search, methodFilter, statusFilter, startDate, endDate]);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#123859]">Pagamentos</h1>
        <div className="flex gap-3">
          {/* Aqui usamos IDs para navegar para criação/registro */}
          <button onClick={() => router.push(`/dashboard/Pagamentos/novo`)} className="bg-[#F9941F] text-white px-4 py-2 rounded">+ Registrar Pagamento</button>
          <button onClick={fetchPayments} className="px-4 py-2 border rounded">Atualizar</button>
        </div>
      </div>

      {/* filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center">
        <input placeholder="Procurar referência/cliente..." value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded md:w-1/3" />
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Todos os métodos</option>
          <option value="PIX">PIX</option>
          <option value="Cartão">Cartão</option>
          <option value="Multicaixa">Multicaixa</option>
          <option value="Transferência">Transferência</option>
          <option value="Boleto">Boleto</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="Conciliado">Conciliado</option>
          <option value="Estornado">Estornado</option>
        </select>
        <div className="flex gap-2 items-center">
          <DatePicker selected={startDate} onChange={d => setStartDate(d)} placeholderText="Data inicial" className="border p-2 rounded" />
          <DatePicker selected={endDate} onChange={d => setEndDate(d)} placeholderText="Data final" className="border p-2 rounded" />
        </div>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full">
          <thead className="bg-[#E5E5E5]">
            <tr>
              <th className="p-2 text-left">Referência</th>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Método</th>
              <th className="p-2 text-right">Valor</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Fatura</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{p.reference}</td>
                <td className="p-2">{p.cliente || '—'}</td>
                <td className="p-2">{p.data}</td>
                <td className="p-2">{p.metodo}</td>
                <td className="p-2 text-right">€ {p.valor.toFixed(2)}</td>
                <td className={`p-2 font-semibold ${p.status === 'Conciliado' ? 'text-green-500' : p.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{p.status}</td>
                <td className="p-2">{p.invoiceId ? <span className="text-sm text-[#123859] font-medium">#{p.invoiceId}</span> : '—'}</td>
                <td className="p-2 flex gap-2">
                  {/* Cada botão agora apenas navega usando ID */}
                  <button onClick={() => router.push(`/dashboard/Pagamentos/${p.id}/conciliar`)} className="text-blue-600 hover:underline">Conciliar</button>
                  <button onClick={() => router.push(`/dashboard/Pagamentos/${p.id}/ver`)} className="text-gray-600 hover:underline">Ver</button>
                  <button onClick={() => router.push(`/dashboard/Pagamentos/${p.id}/apagar`)} className="text-red-500 hover:underline">Apagar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">Nenhum pagamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
