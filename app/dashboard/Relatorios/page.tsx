'use client';
import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { FiEye } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type Status = 'Pago' | 'Pendente' | 'Cancelada';

interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  serie: string;
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCliente, setSearchCliente] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serieFilter, setSerieFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [valorMin, setValorMin] = useState<number | null>(null);
  const [valorMax, setValorMax] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const initialMock: Fatura[] = [
    { id: 1, numero: '001', cliente: 'João Silva', data: '2025-11-01', vencimento: '2025-11-10', total: 120, status: 'Pendente', serie: 'A' },
    { id: 2, numero: '002', cliente: 'Maria Santos', data: '2025-11-03', vencimento: '2025-11-12', total: 300, status: 'Pago', serie: 'B' },
    { id: 3, numero: '003', cliente: 'Pedro Lima', data: '2025-11-05', vencimento: '2025-11-15', total: 220, status: 'Cancelada', serie: 'A' },
  ];

  const fetchFaturas = async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) {
        setFaturas(initialMock);
        return;
      }
      const res = await fetch('/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao buscar faturas');
      const data = await res.json();
      setFaturas(data.items ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro desconhecido');
      setFaturas(initialMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaturas();
  }, []);

  const filtered = useMemo(() => {
    return faturas.filter(f => {
      if (searchCliente && !f.cliente.toLowerCase().includes(searchCliente.toLowerCase())) return false;
      if (statusFilter && f.status !== statusFilter) return false;
      if (serieFilter && f.serie !== serieFilter) return false;
      if (startDate && new Date(f.data) < startDate) return false;
      if (endDate && new Date(f.data) > endDate) return false;
      if (valorMin !== null && f.total < valorMin) return false;
      if (valorMax !== null && f.total > valorMax) return false;
      return true;
    });
  }, [faturas, searchCliente, statusFilter, serieFilter, startDate, endDate, valorMin, valorMax]);

  const totals = useMemo(() => {
    let totalGeral = 0;
    let pago = 0;
    let pendente = 0;
    let cancelada = 0;
    filtered.forEach(f => {
      totalGeral += f.total;
      if (f.status === 'Pago') pago += f.total;
      if (f.status === 'Pendente') pendente += f.total;
      if (f.status === 'Cancelada') cancelada += f.total;
    });
    return { totalGeral, pago, pendente, cancelada };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Número', 'Cliente', 'Data', 'Vencimento', 'Total', 'Status', 'Série'];
    const rows = filtered.map(f => [f.numero, f.cliente, f.data, f.vencimento, f.total.toFixed(2), f.status, f.serie]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_faturas_${Date.now()}.csv`;
    link.click();
  };

 
  const hoje = new Date();

  const statusChartData = {
    labels: ['Pago', 'Pendente', 'Cancelada'],
    datasets: [
      {
        label: 'Total por Status (€)',
        data: [totals.pago, totals.pendente, totals.cancelada],
        backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
      },
    ],
  };

  const linhaChartData = {
    labels: filtered.map(f => f.data),
    datasets: [
      {
        label: 'Valor da Fatura (€)',
        data: filtered.map(f => f.total),
        borderColor: '#F9941F',
        backgroundColor: '#F9941F33',
        tension: 0.3,
      },
    ],
  };

  return (
    <MainLayout>

      {/* filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center flex-wrap">
        <input type="text" placeholder="Pesquisar cliente..." value={searchCliente} onChange={e => setSearchCliente(e.target.value)} className="border p-2 rounded md:w-1/4" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Todos os status</option>
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
          <option value="Cancelada">Cancelada</option>
        </select>
        <select value={serieFilter} onChange={e => setSerieFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Todas as séries</option>
          <option value="A">Série A</option>
          <option value="B">Série B</option>
        </select>
        <DatePicker selected={startDate} onChange={d => setStartDate(d)} placeholderText="Data inicial" className="border p-2 rounded" />
        <DatePicker selected={endDate} onChange={d => setEndDate(d)} placeholderText="Data final" className="border p-2 rounded" />
        <input type="number" placeholder="Valor mínimo" value={valorMin ?? ''} onChange={e => setValorMin(e.target.value ? Number(e.target.value) : null)} className="border p-2 rounded w-32" />
        <input type="number" placeholder="Valor máximo" value={valorMax ?? ''} onChange={e => setValorMax(e.target.value ? Number(e.target.value) : null)} className="border p-2 rounded w-32" />
      </div>

      {loading && <div className="p-6 text-center text-gray-500">Carregando...</div>}
      {error && <p className="text-red-500">{error}</p>}

      {/* tabela */}
      <div className="overflow-x-auto bg-white shadow rounded mb-6">
        <table className="w-full">
          <thead className="bg-[#E5E5E5]">
            <tr>
              <th className="p-2 text-left">Número</th>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Vencimento</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Série</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const vencida = f.status === 'Pendente' && new Date(f.vencimento) < hoje;
              return (
                <tr key={f.id} className={`border-t hover:bg-gray-50 ${vencida ? 'bg-red-50' : ''}`}>
                  <td className="p-2 font-medium text-[#123859]">{f.numero}</td>
                  <td className="p-2">{f.cliente}</td>
                  <td className="p-2">{f.data}</td>
                  <td className={`p-2 ${vencida ? 'text-red-500 font-semibold' : ''}`}>{f.vencimento}</td>
                  <td className="p-2 text-right">€ {f.total.toFixed(2)}</td>
                  <td className={`p-2 font-semibold ${f.status === 'Pago' ? 'text-green-500' : f.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{f.status}</td>
                  <td className="p-2">{f.serie}</td>
                  <td className="p-2">
                    <button onClick={() => router.push(`/dashboard/Relatorios/${f.id}/ver`)} className="text-blue-600 hover:underline flex items-center gap-1">
                      <FiEye /> Ver
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">Nenhuma fatura encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* gráficos */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold text-[#123859] mb-3">Total por Status</h2>
          <Bar data={statusChartData} />
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold text-[#123859] mb-3">Faturamento ao Longo do Tempo</h2>
          <Line data={linhaChartData} />
        </div>
      </div>

      {/* totais */}
      <div className="mt-6 bg-[#E5E5E5] p-4 rounded flex flex-col md:flex-row justify-between gap-3">
        <div>Total Geral: € {totals.totalGeral.toFixed(2)}</div>
        <div>Pago: € {totals.pago.toFixed(2)}</div>
        <div>Pendente: € {totals.pendente.toFixed(2)}</div>
        <div>Cancelada: € {totals.cancelada.toFixed(2)}</div>
      </div>
    </MainLayout>
  );
}
