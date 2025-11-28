'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../components/MainLayout';

type InvoiceItem = {
  id: number;
  productName: string;
  quantity: number;
  price: number;
};

type StatusType = 'pendente' | 'pago' | 'cancelado';

export default function NovaFaturaPage() {
  const router = useRouter();

  // Campos da fatura
  const [empresaId, setEmpresaId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [nifCliente, setNifCliente] = useState('');
  const [numero, setNumero] = useState(`FAT-${Date.now()}`);
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0,10));
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().slice(0,10));
  const [status, setStatus] = useState<StatusType>('pendente');
  const [tipo, setTipo] = useState<StatusType>('pendente');

  // Itens da fatura
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), productName: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (id: number, key: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: value } : i));
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const valorTotal = items.reduce((acc, i) => acc + i.quantity * i.price, 0);

  const saveInvoice = async () => {
    if (!empresaId || !clienteId || !nifCliente || items.length === 0) {
      setError('Preencha empresa, cliente, NIF e pelo menos um item.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Aqui chamaria a API para salvar a fatura
      // const res = await fetch('/api/faturas', { method: 'POST', body: JSON.stringify({ ... }) });
      // if (!res.ok) throw new Error('Erro ao salvar fatura.');

      console.log({
        empresaId, clienteId, nifCliente, numero,
        dataEmissao, dataVencimento, status, tipo,
        items, valorTotal
      });

      router.push('/dashboard/Faturas'); // volta para lista de faturas
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar fatura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Nova Fatura</h1>

        {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{error}</div>}
        {loading && <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-3">A salvar...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Empresa</label>
            <input type="text" value={empresaId} onChange={e => setEmpresaId(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cliente</label>
            <input type="text" value={clienteId} onChange={e => setClienteId(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">NIF Cliente</label>
            <input type="text" value={nifCliente} onChange={e => setNifCliente(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Número da Fatura</label>
            <input type="text" value={numero} onChange={e => setNumero(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Data Emissão</label>
            <input type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Data Vencimento</label>
            <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as StatusType)} className="border p-2 rounded w-full">
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value as StatusType)} className="border p-2 rounded w-full">
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Itens */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#123859] mb-2">Itens</h2>
          {items.map((item) => (
            <div key={item.id} className="flex gap-2 mb-2 items-center">
              <input type="text" placeholder="Produto" value={item.productName} onChange={e => updateItem(item.id, 'productName', e.target.value)} className="border p-2 rounded flex-1"/>
              <input type="number" placeholder="Qtd" value={item.quantity} min={1} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} className="border p-2 rounded w-20"/>
              <input type="number" placeholder="Preço" value={item.price} min={0} step={0.01} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value))} className="border p-2 rounded w-24"/>
              <button onClick={() => removeItem(item.id)} className="px-2 py-1 bg-red-500 text-white rounded">Apagar</button>
            </div>
          ))}
          <button onClick={addItem} className="px-4 py-2 bg-[#F9941F] text-white rounded">+ Adicionar Item</button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">Valor Total: € {valorTotal.toFixed(2)}</div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => router.push('/dashboard/Faturas')} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={saveInvoice} className="px-4 py-2 bg-[#F9941F] text-white rounded">Salvar Fatura</button>
        </div>
      </div>
    </MainLayout>
  );
}
