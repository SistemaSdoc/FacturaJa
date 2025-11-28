'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  data: string; // ISO date or yyyy-mm-dd
  vencimento: string;
  total: number;
  status: Status;
  serie: string;
  items?: LineItem[];
  notas?: string;
}

export default function FaturasPage() {
  const router = useRouter();

  // --- mock inicial (vai ser substituído pela API quando disponível) ---
  const initialMock: Fatura[] = [
    { id: 1, numero: '001', cliente: 'João Silva', data: '2025-11-01', vencimento: '2025-11-10', total: 120, status: 'Pendente', serie: 'A',
      items: [{ id: 1, descricao: 'Produto A', quantidade: 2, precoUnitario: 30, impostoPercent: 0 }] },
    { id: 2, numero: '002', cliente: 'Maria Santos', data: '2025-11-03', vencimento: '2025-11-12', total: 300, status: 'Pago', serie: 'B',
      items: [{ id: 1, descricao: 'Serviço X', quantidade: 1, precoUnitario: 300, impostoPercent: 0 }] },
  ];

  const [faturas, setFaturas] = useState<Fatura[]>(initialMock);
  const [selected, setSelected] = useState<number[]>([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSerie, setFilterSerie] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalConfirm, setModalConfirm] = useState<{ open: boolean; action: string; id?: number }>({ open: false, action: '', id: undefined });

  // View modal (kept for quick preview)
  const [viewFatura, setViewFatura] = useState<Fatura | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // --- Filtragem (mock) ---
  useEffect(() => {
    setError('');
  }, [searchCliente, filterStatus, filterSerie, startDate, endDate]);

  const filtered = useMemo(() => {
    let data = faturas.slice();
    if (searchCliente) data = data.filter(f => f.cliente.toLowerCase().includes(searchCliente.toLowerCase()));
    if (filterStatus) data = data.filter(f => f.status === filterStatus);
    if (filterSerie) data = data.filter(f => f.serie === filterSerie);
    if (startDate) data = data.filter(f => new Date(f.data) >= startDate);
    if (endDate) data = data.filter(f => new Date(f.data) <= endDate);
    return data;
  }, [faturas, searchCliente, filterStatus, filterSerie, startDate, endDate]);

  // seleção
  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // --- Ações simuladas / reais ---
  const handleAction = async (idOrIds: number | number[], action: string) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    if (token) {
      try {
        setLoading(true);
        const promises = ids.map(id => {
          let url = `/api/invoices/${id}`;
          let method = 'POST';
          if (action === 'pagar') url += '/pay';
          else if (action === 'cancelar') url += '/cancel';
          else if (action === 'enviar') url += '/send';
          else if (action === 'delete') method = 'DELETE';
          return fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        });
        await Promise.all(promises);
        setSelected([]);
        setModalConfirm({ open: false, action: '' });
        // ideal: re-fetch list from API aqui
      } catch (err) {
        console.error(err);
        setError('Erro ao executar ação (API)');
      } finally {
        setLoading(false);
      }
    } else {
      // Mock behavior: aplicar as ações localmente
      const updated = [...faturas];
      ids.forEach(id => {
        const idx = updated.findIndex(f => f.id === id);
        if (idx === -1) return;
        if (action === 'pagar') updated[idx].status = 'Pago';
        if (action === 'cancelar') updated[idx].status = 'Cancelada';
        if (action === 'delete') updated.splice(idx, 1);
        if (action === 'enviar') {
          // apenas simula: poderia marcar um flag "enviado"
        }
      });
      setFaturas(updated);
      setSelected([]);
      setModalConfirm({ open: false, action: '' });
    }
  };

  // --- Nova fatura: cria e redireciona para rota de edição ---
  const openCreateAndEdit = async () => {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().split('T')[0];
    const newF: Fatura = {
      id: Date.now(),
      numero: String((faturas.length + 1)).padStart(3, '0'),
      cliente: '',
      data: iso(today),
      vencimento: iso(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
      total: 0,
      status: 'Pendente',
      serie: 'A',
      items: [{ id: 1, descricao: '', quantidade: 1, precoUnitario: 0, impostoPercent: 0 }],
      notas: ''
    };

    if (token) {
      // Se tiver API, cria no backend e redireciona para o id retornado
      try {
        setLoading(true);
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(newF),
        });
        if (!res.ok) throw new Error('Erro ao criar fatura (API)');
        const created = await res.json();
        // actualizar estado local (opcional)
        setFaturas(prev => [created, ...prev]);
        // redirecionar para edição da fatura criada (usar id vindo do backend)
        router.push(`/dashboard/Faturas/${created.id}/editar`);
      } catch (err) {
        console.error(err);
        setError('Erro ao criar fatura (API). A fallback local será usada.');
        // fallback local:
        setFaturas(prev => [newF, ...prev]);
        router.push(`/dashboard/Faturas/${newF.id}/editar`);
      } finally {
        setLoading(false);
      }
    } else {
      // fallback local: guarda no state e redireciona para rota de edição mock
      setFaturas(prev => [newF, ...prev]);
      router.push(`/dashboard/Faturas/${newF.id}/editar`);
    }
  };

  // --- Abrir edição: REDIRECIONA para página de edição ---
  const openEditForm = (f: Fatura) => {
    router.push(`/dashboard/Faturas/${f.id}/editar`);
  };

  // =======================================================
  // Helpers de totais (para view modal)
  // =======================================================
  const computeTotals = (items: LineItem[] | undefined) => {
    if (!items) return { subtotal: 0, imposto: 0, total: 0 };
    let subtotal = 0, imposto = 0;
    items.forEach(i => {
      const line = i.quantidade * i.precoUnitario;
      subtotal += line;
      imposto += line * (i.impostoPercent / 100);
    });
    const total = subtotal + imposto;
    return { subtotal, imposto, total };
  };

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#123859]">Faturas</h1>
        <div className="flex gap-3">
          <button
            onClick={openCreateAndEdit}
            className="bg-[#F9941F] text-white px-4 py-2 rounded hover:brightness-95"
          >
            + Nova Fatura
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
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border p-2 rounded w-full md:w-1/6"
        >
          <option value="">Todos os status</option>
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
          <option value="Cancelada">Cancelada</option>
        </select>
        <select
          value={filterSerie}
          onChange={e => setFilterSerie(e.target.value)}
          className="border p-2 rounded w-full md:w-1/6"
        >
          <option value="">Todas as séries</option>
          <option value="A">Série A</option>
          <option value="B">Série B</option>
        </select>
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Data inicial" className="border p-1 rounded w-full md:w-5/6" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="Data final" className="border p-1 rounded w-full md:w-5/6" />
        {selected.length > 0 && (
          <button onClick={() => setModalConfirm({ open: true, action: 'delete' })} className="bg-red-500 text-white px-4 py-2 rounded">
            Apagar selecionados ({selected.length})
          </button>
        )}
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* tabela */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full border-collapse">
          <thead className="bg-[#E5E5E5]">
            <tr>
              <th className="p-2"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(f => f.id) : [])} /></th>
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
                <td className="p-2"><input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleSelect(f.id)} /></td>
                <td className="p-2 font-medium text-[#123859]">{f.numero}</td>
                <td className="p-2">{f.cliente}</td>
                <td className="p-2">{f.data}</td>
                <td className="p-2">{f.vencimento}</td>
                <td className="p-2">€ {Number(f.total).toFixed(2)}</td>
                <td className={`p-2 font-semibold ${f.status === 'Pago' ? 'text-green-500' : f.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{f.status}</td>
                <td className="p-2">{f.serie}</td>
                <td className="p-2 flex gap-2">
                  {/* agora cada botão redireciona para a rota correta com id */}
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/ver`)} className="text-blue-500 hover:underline">Ver</button>
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/editar`)} className="text-orange-500 hover:underline">Editar</button>
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/enviar`)} className="text-green-500 hover:underline">Enviar</button>
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/pagar`)} className="text-purple-500 hover:underline">Pagar</button>
                  <button onClick={() => router.push(`/dashboard/Faturas/${f.id}/cancelar`)} className="text-red-500 hover:underline">Cancelar</button>
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

      {/* Modal visualizar (mantive como preview rápido, mas agora Ver redireciona para /ver) */}
      {viewFatura && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-24 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#123859]">Fatura {viewFatura.numero}</h2>
              <button className="text-gray-500" onClick={() => setViewFatura(null)}>Fechar</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Cliente</strong></p>
                <p>{viewFatura.cliente}</p>
              </div>
              <div>
                <p><strong>Data / Vencimento</strong></p>
                <p>{viewFatura.data} / {viewFatura.vencimento}</p>
              </div>
              <div className="col-span-2">
                <p><strong>Itens</strong></p>
                <ul className="mt-2 space-y-2">
                  {(viewFatura.items ?? []).map(it => (
                    <li key={it.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{it.descricao}</div>
                        <div className="text-sm text-gray-500">{it.quantidade} × €{it.precoUnitario.toFixed(2)} ({it.impostoPercent}% imposto)</div>
                      </div>
                      <div>€ {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent/100)).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => setViewFatura(null)} className="px-4 py-2 border rounded">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm */}
      {modalConfirm.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-40">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-semibold text-[#123859] mb-3">Confirmar ação</h3>
            <p className="mb-4">Tem certeza que deseja {modalConfirm.action} {modalConfirm.id ? 'esta fatura?' : 'as selecionadas?'}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalConfirm({ open: false, action: '' })} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={() => handleAction(modalConfirm.id ?? selected, modalConfirm.action)} className="px-4 py-2 bg-[#F9941F] text-white rounded">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
