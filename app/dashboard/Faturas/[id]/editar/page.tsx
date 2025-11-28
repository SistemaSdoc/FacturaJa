'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

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
  data: string; // yyyy-mm-dd
  vencimento: string;
  total: number;
  status: Status;
  serie: string;
  items?: LineItem[];
  notas?: string;
}

export default function EditarFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fatura, setFatura] = useState<Fatura | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // MOCK fallback if API not available
  const mockData: Fatura[] = [
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
      notas: 'Entrega na morada'
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
      notas: ''
    }
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const parsedId = Number(id);
        if (token) {
          const res = await fetch(`/api/invoices/${parsedId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error(`Erro ao obter fatura (${res.status})`);
          const data = await res.json();
          // map / normalize if necessary
          setFatura({
            ...data,
            items: data.items?.map((it: any, idx: number) => ({
              id: it.id ?? idx + 1,
              descricao: it.descricao ?? it.description ?? '',
              quantidade: Number(it.quantidade ?? it.qty ?? 1),
              precoUnitario: Number(it.precoUnitario ?? it.unit_price ?? 0),
              impostoPercent: Number(it.impostoPercent ?? it.vat ?? 0),
            })) ?? []
          });
        } else {
          // fallback mock
          const found = mockData.find(m => m.id === parsedId);
          if (!found) throw new Error('Fatura não encontrada (mock).');
          // deep clone
          setFatura(JSON.parse(JSON.stringify(found)));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro ao carregar fatura.');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Totals
  const totals = useMemo(() => {
    const items = fatura?.items ?? [];
    let subtotal = 0;
    let imposto = 0;
    items.forEach(it => {
      const line = it.quantidade * it.precoUnitario;
      subtotal += line;
      imposto += line * (it.impostoPercent / 100);
    });
    return { subtotal, imposto, total: subtotal + imposto };
  }, [fatura]);

  function updateField<K extends keyof Fatura>(key: K, value: Fatura[K]) {
    setFatura(prev => prev ? { ...prev, [key]: value } : prev);
  }

  function updateLine(lineId: number, patch: Partial<LineItem>) {
    if (!fatura) return;
    const items = (fatura.items ?? []).map(it => it.id === lineId ? { ...it, ...patch } : it);
    setFatura({ ...fatura, items });
  }

  function addLine() {
    if (!fatura) return;
    const nextId = (fatura.items ?? []).reduce((acc, i) => Math.max(acc, i.id), 0) + 1;
    const items = [...(fatura.items ?? []), { id: nextId, descricao: '', quantidade: 1, precoUnitario: 0, impostoPercent: 0 }];
    setFatura({ ...fatura, items });
  }

  function removeLine(lineId: number) {
    if (!fatura) return;
    const items = (fatura.items ?? []).filter(i => i.id !== lineId);
    setFatura({ ...fatura, items });
  }

  async function handleSave() {
    if (!fatura) return;
    // basic validation
    if (!fatura.cliente || fatura.cliente.trim().length < 2) {
      alert('Preencha o cliente (mínimo 2 caracteres).');
      return;
    }
    if (!fatura.items || fatura.items.length === 0) {
      alert('Adicione pelo menos 1 item.');
      return;
    }
    for (const it of fatura.items) {
      if (!it.descricao || it.descricao.trim() === '') {
        alert('Cada item precisa de descrição.');
        return;
      }
      if (it.quantidade <= 0) {
        alert('Quantidade deve ser maior que 0.');
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      const payload = { ...fatura, total: Number(totals.total.toFixed(2)) };
      if (token) {
        const res = await fetch(`/api/invoices/${fatura.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Erro ao salvar (status ${res.status})`);
        // optionally read response
        // const saved = await res.json();
      } else {
        // In-memory mock update — in app you'd re-fetch list
        // Here we just simulate success
      }
      // após salvar redireciona para lista de faturas
      router.push('/Dashboard/Faturas');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar fatura.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">Carregando fatura...</div>
      </MainLayout>
    );
  }

  if (!fatura) {
    return (
      <MainLayout>
        <div className="p-6 text-red-600">Fatura não encontrada. {error && <span>- {error}</span>}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#123859]">Editar Fatura #{fatura.numero}</h1>
          <div className="flex gap-2">
            <button onClick={() => router.push('/dashboard/Faturas')} className="px-3 py-2 border rounded">Voltar</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#F9941F] text-white rounded">
              {saving ? 'A gravar...' : 'Guardar alterações'}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium">Número</label>
              <input className="w-full border p-2 rounded" value={fatura.numero} onChange={e => updateField('numero', e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium">Série</label>
              <select className="w-full border p-2 rounded" value={fatura.serie} onChange={e => updateField('serie', e.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select className="w-full border p-2 rounded" value={fatura.status} onChange={e => updateField('status', e.target.value as Status)}>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <input className="w-full border p-2 rounded" value={fatura.cliente} onChange={e => updateField('cliente', e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium">Data</label>
                <input type="date" className="w-full border p-2 rounded" value={fatura.data} onChange={e => updateField('data', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Vencimento</label>
                <input type="date" className="w-full border p-2 rounded" value={fatura.vencimento} onChange={e => updateField('vencimento', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium">Notas</label>
            <textarea className="w-full border p-2 rounded" rows={3} value={fatura.notas ?? ''} onChange={e => updateField('notas', e.target.value)} />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Itens</h3>
              <button onClick={addLine} className="px-3 py-1 bg-[#123859] text-white rounded text-sm">Adicionar linha</button>
            </div>

            <div className="space-y-3">
              {(fatura.items ?? []).map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input className="w-full border p-2 rounded" placeholder="Descrição" value={item.descricao}
                      onChange={e => updateLine(item.id, { descricao: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={1} className="w-full border p-2 rounded" value={item.quantidade}
                      onChange={e => updateLine(item.id, { quantidade: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={0} step="0.01" className="w-full border p-2 rounded" value={item.precoUnitario}
                      onChange={e => updateLine(item.id, { precoUnitario: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={0} max={100} step="0.1" className="w-full border p-2 rounded" value={item.impostoPercent}
                      onChange={e => updateLine(item.id, { impostoPercent: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="col-span-1 text-right">
                    <button onClick={() => removeLine(item.id)} className="text-red-500">×</button>
                  </div>
                </div>
              ))}
              {(fatura.items ?? []).length === 0 && <div className="text-sm text-gray-500">Nenhuma linha adicionada.</div>}
            </div>
          </div>

          <div className="bg-[#F2F2F2] p-3 rounded">
            <div className="flex justify-between"><span>Subtotal</span><span>€ {totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Imposto</span><span>€ {totals.imposto.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold mt-2"><span>Total</span><span>€ {totals.total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => router.push('/Dashboard/Faturas')} className="px-3 py-2 border rounded">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#F9941F] text-white rounded">{saving ? 'A gravar...' : 'Salvar'}</button>
        </div>
      </div>
    </MainLayout>
  );
}
