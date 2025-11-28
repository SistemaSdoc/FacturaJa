'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  serie: string;
  items?: LineItem[];
  notas?: string;
}

export default function FaturasPage() {
  const router = useRouter();

  // --- dados mock ---
  const initialMock: Fatura[] = [
    {
      id: 1,
      numero: '001',
      cliente: 'João Silva',
      data: '2025-11-01',
      vencimento: '2025-11-10',
      total: 120,
      status: 'Pendente',
      serie: 'A',
      items: [{ id: 1, descricao: 'Produto A', quantidade: 2, precoUnitario: 30, impostoPercent: 0 }],
    },
    {
      id: 2,
      numero: '002',
      cliente: 'Maria Santos',
      data: '2025-11-03',
      vencimento: '2025-11-12',
      total: 300,
      status: 'Pago',
      serie: 'B',
      items: [{ id: 1, descricao: 'Serviço X', quantidade: 1, precoUnitario: 300, impostoPercent: 0 }],
    },
  ];

  const [faturas, setFaturas] = useState<Fatura[]>(initialMock);
  const [selected, setSelected] = useState<number[]>([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSerie, setFilterSerie] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [modalConfirm, setModalConfirm] = useState<{ open: boolean; action: string; id?: number }>({ open: false, action: '', id: undefined });
  const [modalExport, setModalExport] = useState(false);
  const [viewFatura, setViewFatura] = useState<Fatura | null>(null);

  // --- filtragem ---
  const filtered = useMemo(() => {
    let data = [...faturas];
    if (searchCliente) data = data.filter(f => f.cliente.toLowerCase().includes(searchCliente.toLowerCase()));
    if (filterStatus) data = data.filter(f => f.status === filterStatus);
    if (filterSerie) data = data.filter(f => f.serie === filterSerie);
    if (startDate) data = data.filter(f => new Date(f.data) >= startDate);
    if (endDate) data = data.filter(f => new Date(f.data) <= endDate);
    return data;
  }, [faturas, searchCliente, filterStatus, filterSerie, startDate, endDate]);

  const toggleSelect = (id: number) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  // --- ações simuladas ---
  const handleAction = (idOrIds: number | number[], action: string) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    const updated = [...faturas];
    ids.forEach(id => {
      const idx = updated.findIndex(f => f.id === id);
      if (idx === -1) return;
      if (action === 'pagar') updated[idx].status = 'Pago';
      if (action === 'cancelar') updated[idx].status = 'Cancelada';
      if (action === 'delete') updated.splice(idx, 1);
    });
    setFaturas(updated);
    setSelected([]);
    setModalConfirm({ open: false, action: '' });
  };

  // --- criar nova fatura mock ---
  const openCreateAndEdit = () => {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().split('T')[0];
    const newF: Fatura = {
      id: Date.now(),
      numero: String(faturas.length + 1).padStart(3, '0'),
      cliente: '',
      data: iso(today),
      vencimento: iso(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
      total: 0,
      status: 'Pendente',
      serie: 'A',
      items: [{ id: 1, descricao: '', quantidade: 1, precoUnitario: 0, impostoPercent: 0 }],
      notas: '',
    };
    setFaturas(prev => [newF, ...prev]);
    router.push(`/dashboard/Faturas/${newF.id}/nova-fatura`);
  };

  const openEditForm = (f: Fatura) => router.push(`/dashboard/Faturas/${f.id}/nova-fatura`);

  // --- Exportar fatura em PDF ---
  const exportFatura = () => {
    if (selected.length === 0) {
      alert('Selecione pelo menos uma fatura para exportar.');
      return;
    }
    setModalExport(true); // abre o modal de confirmação de export
  };

  const confirmExport = () => {
    selected.forEach(id => {
      const f = faturas.find(f => f.id === id);
      if (!f) return;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Fatura ${f.numero}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Cliente: ${f.cliente}`, 14, 30);
      doc.text(`Data: ${f.data} | Vencimento: ${f.vencimento}`, 14, 36);
      doc.text(`Status: ${f.status} | Série: ${f.serie}`, 14, 42);

      const tableData = (f.items ?? []).map(it => [
        it.descricao,
        it.quantidade.toString(),
        `€ ${it.precoUnitario.toFixed(2)}`,
        `${it.impostoPercent}%`,
        `€ ${(it.quantidade * it.precoUnitario * (1 + it.impostoPercent / 100)).toFixed(2)}`,
      ]);

      autoTable(doc, {
        head: [['Descrição', 'Qtd', 'Preço Unit.', 'Imposto', 'Total']],
        body: tableData,
        startY: 50,
      });

      doc.text(`Total: € ${f.total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
      doc.save(`fatura_${f.numero}.pdf`);
    });
    setModalExport(false);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#123859]">Faturas</h1>
        <div className="flex gap-2">
          <button
            onClick={openCreateAndEdit}
            className="bg-[#F9941F] text-white px-4 py-2 rounded hover:brightness-95"
          >
            + Nova Fatura
          </button>
          <button
            onClick={exportFatura}
            className="bg-[#123859] text-white px-4 py-2 rounded hover:brightness-95"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Pesquisar cliente..."
          value={searchCliente}
          onChange={e => setSearchCliente(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-[#F9941F]"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border p-2 rounded w-full md:w-1/6">
          <option value="">Todos os status</option>
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
          <option value="Cancelada">Cancelada</option>
        </select>
        <select value={filterSerie} onChange={e => setFilterSerie(e.target.value)} className="border p-2 rounded w-full md:w-1/6">
          <option value="">Todas as séries</option>
          <option value="A">Série A</option>
          <option value="B">Série B</option>
        </select>
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Data inicial" className="border p-1 rounded w-full md:w-5/6" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="Data final" className="border p-1 rounded w-full md:w-5/6" />
      </div>

      {/* tabela */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full border-collapse">
          <thead className="bg-[#E5E5E5]">
            <tr>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={e => setSelected(e.target.checked ? filtered.map(f => f.id) : [])}
                />
              </th>
              <th className="p-2 text-left">Número</th>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Vencimento</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Série</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleSelect(f.id)} />
                </td>
                <td className="p-2 font-medium text-[#123859]">{f.numero}</td>
                <td className="p-2">{f.cliente}</td>
                <td className="p-2">{f.data}</td>
                <td className="p-2">{f.vencimento}</td>
                <td className="p-2">€ {Number(f.total).toFixed(2)}</td>
                <td className={`p-2 font-semibold ${f.status === 'Pago' ? 'text-green-500' : f.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{f.status}</td>
                <td className="p-2">{f.serie}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/ver`)} className="text-blue-500">Ver</button>
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/editar`)} className="text-orange-500">Editar</button>
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/pagar`)} className="text-purple-500">Pagar</button>
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/cancelar`)} className="text-red-500">Cancelar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">Nenhuma fatura encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmação exportação */}
      {modalExport && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-semibold text-[#123859] mb-3">Confirmar exportação</h3>
            <p className="mb-4">Você selecionou {selected.length} fatura(s). Deseja exportar para PDF?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalExport(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={confirmExport} className="px-4 py-2 bg-[#F9941F] text-white rounded">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
