// app/Dashboard/Pagamentos/page.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // modal register
  const [openRegister, setOpenRegister] = useState(false);
  const [registerPayload, setRegisterPayload] = useState<Partial<Payment>>({
    reference: '',
    cliente: '',
    data: new Date().toISOString().split('T')[0],
    metodo: 'PIX',
    valor: 0,
    status: 'Pendente',
    invoiceId: null,
    nota: '',
  });

  // modal reconcile
  const [openReconcile, setOpenReconcile] = useState(false);
  const [reconcilePayment, setReconcilePayment] = useState<Payment | null>(null);
  const [reconcileInvoiceId, setReconcileInvoiceId] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // mock initial (fallback)
  const initialMock: Payment[] = [
    { id: 1, reference: 'PAY-2025-001', cliente: 'João Silva', data: '2025-11-20', metodo: 'PIX', valor: 150.0, status: 'Pendente', invoiceId: null },
    { id: 2, reference: 'PAY-2025-002', cliente: 'Loja ABC', data: '2025-11-18', metodo: 'Cartão', valor: 320.5, status: 'Conciliado', invoiceId: 2 },
  ];

  // Fetch payments from API (or use mock)
  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) {
        // fallback local
        setPayments(initialMock);
        return;
      }
      const params = new URLSearchParams();
      // optionally add params...
      const res = await fetch(`/api/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao buscar pagamentos');
      const data = await res.json();
      // espera-se data.items ou data (ajusta conforme API)
      setPayments(Array.isArray(data) ? data : data.items ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro desconhecido');
      setPayments(initialMock); // fallback para development
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (search) {
        const s = search.toLowerCase();
        if (!(`${p.reference} ${p.cliente ?? ''} ${p.nota ?? ''}`).toLowerCase().includes(s)) return false;
      }
      if (methodFilter && p.metodo !== methodFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (startDate && new Date(p.data) < startDate) return false;
      if (endDate && new Date(p.data) > endDate) return false;
      return true;
    });
  }, [payments, search, methodFilter, statusFilter, startDate, endDate]);

  // Register new payment
  const handleRegister = async () => {
    // basic validation
    if (!registerPayload.reference || !registerPayload.valor || registerPayload.valor <= 0) {
      alert('Preencha referência e valor válidos.');
      return;
    }
    setLoading(true);
    try {
      if (!token) {
        // local fallback
        const newP: Payment = { id: Date.now(), ...(registerPayload as Payment) } as Payment;
        setPayments((s) => [newP, ...s]);
        setOpenRegister(false);
        return;
      }
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });
      if (!res.ok) throw new Error('Erro ao registar pagamento');
      const saved = await res.json();
      setPayments((s) => [saved, ...s]);
      setOpenRegister(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao registar pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Reconcile payment to invoice
  const handleReconcile = async (paymentId: number, invoiceId: number) => {
    setLoading(true);
    try {
      if (!token) {
        // local fallback
        setPayments((s) => s.map(p => p.id === paymentId ? { ...p, invoiceId, status: 'Conciliado' } : p));
        setOpenReconcile(false);
        setReconcilePayment(null);
        setReconcileInvoiceId(null);
        return;
      }
      const res = await fetch(`/api/payments/${paymentId}/allocate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      if (!res.ok) throw new Error('Erro ao conciliar pagamento');
      const updated = await res.json();
      setPayments((s) => s.map(p => p.id === paymentId ? updated : p));
      setOpenReconcile(false);
      setReconcilePayment(null);
      setReconcileInvoiceId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao conciliar');
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const handleDelete = async (id: number) => {
    if (!confirm('Deseja apagar este pagamento?')) return;
    setLoading(true);
    try {
      if (!token) {
        setPayments((s) => s.filter(p => p.id !== id));
        return;
      }
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao apagar');
      setPayments((s) => s.filter(p => p.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao apagar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-[#123859]">Pagamentos</h1>
        <div className="flex gap-3">
          <button onClick={() => { setOpenRegister(true); setRegisterPayload({ ...registerPayload, data: new Date().toISOString().split('T')[0] }); }} className="bg-[#F9941F] text-white px-4 py-2 rounded">+ Registrar Pagamento</button>
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
                  <button onClick={() => { setReconcilePayment(p); setOpenReconcile(true); }} className="text-blue-600 hover:underline">Conciliar</button>
                  <button onClick={() => alert(JSON.stringify(p, null, 2))} className="text-gray-600 hover:underline">Ver</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">Apagar</button>
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

      {/* Modal Register */}
      {openRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded p-6 w-full max-w-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#123859]">Registrar Pagamento</h3>
              <button onClick={() => setOpenRegister(false)} className="text-gray-500">Fechar</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm">Referência</label>
                <input className="w-full border p-2 rounded" value={registerPayload.reference} onChange={e => setRegisterPayload(prev => ({ ...prev, reference: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm">Cliente (opcional)</label>
                  <input className="w-full border p-2 rounded" value={registerPayload.cliente} onChange={e => setRegisterPayload(prev => ({ ...prev, cliente: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm">Data</label>
                  <input type="date" className="w-full border p-2 rounded" value={registerPayload.data} onChange={e => setRegisterPayload(prev => ({ ...prev, data: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm">Método</label>
                  <select className="w-full border p-2 rounded" value={registerPayload.metodo} onChange={e => setRegisterPayload(prev => ({ ...prev, metodo: e.target.value as PaymentMethod }))}>
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Multicaixa">Multicaixa</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Valor</label>
                  <input type="number" step="0.01" className="w-full border p-2 rounded" value={registerPayload.valor ?? ''} onChange={e => setRegisterPayload(prev => ({ ...prev, valor: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm">Status</label>
                  <select className="w-full border p-2 rounded" value={registerPayload.status} onChange={e => setRegisterPayload(prev => ({ ...prev, status: e.target.value as PaymentStatus }))}>
                    <option value="Pendente">Pendente</option>
                    <option value="Conciliado">Conciliado</option>
                    <option value="Estornado">Estornado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm">Nota</label>
                <input className="w-full border p-2 rounded" value={registerPayload.nota} onChange={e => setRegisterPayload(prev => ({ ...prev, nota: e.target.value }))} />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setOpenRegister(false)} className="px-4 py-2 border rounded">Cancelar</button>
                <button onClick={handleRegister} className="px-4 py-2 bg-[#F9941F] text-white rounded">{loading ? 'Aguarde...' : 'Registrar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reconcile */}
      {openReconcile && reconcilePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded p-6 w-full max-w-md shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#123859]">Conciliar Pagamento</h3>
              <button onClick={() => { setOpenReconcile(false); setReconcilePayment(null); setReconcileInvoiceId(null); }} className="text-gray-500">Fechar</button>
            </div>

            <p className="mb-3"><strong>Pagamento:</strong> {reconcilePayment.reference} — € {reconcilePayment.valor.toFixed(2)}</p>

            <div>
              <label className="block text-sm">Id da fatura a conciliar</label>
              <input type="number" className="w-full border p-2 rounded" value={reconcileInvoiceId ?? ''} onChange={e => setReconcileInvoiceId(e.target.value ? Number(e.target.value) : null)} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setOpenReconcile(false); setReconcilePayment(null); setReconcileInvoiceId(null); }} className="px-4 py-2 border rounded">Cancelar</button>
              <button disabled={!reconcileInvoiceId} onClick={() => handleReconcile(reconcilePayment.id, reconcileInvoiceId!)} className="px-4 py-2 bg-[#F9941F] text-white rounded">Conciliar</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
