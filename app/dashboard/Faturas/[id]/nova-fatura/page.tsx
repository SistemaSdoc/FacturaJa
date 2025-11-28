'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

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
  status: 'Pago' | 'Pendente' | 'Cancelada';
  serie: string;
  items?: LineItem[];
  notas?: string;
}

export default function NovaFaturaPage() {
  const router = useRouter();
  const [fatura, setFatura] = useState<Fatura>({
    id: Date.now(),
    numero: '',
    cliente: '',
    data: '',
    vencimento: '',
    total: 0,
    status: 'Pendente',
    serie: 'A',
    items: [],
    notas: ''
  });

  const handleChange = (field: keyof Fatura, value: any) => {
    setFatura({ ...fatura, [field]: value });
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    if (!fatura.items) return;
    const updatedItems = [...fatura.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFatura({ ...fatura, items: updatedItems });
  };

  const addItem = () => {
    const newItem: LineItem = { id: Date.now(), descricao: '', quantidade: 1, precoUnitario: 0, impostoPercent: 0 };
    setFatura({ ...fatura, items: [...(fatura.items || []), newItem] });
  };

  const removeItem = (index: number) => {
    if (!fatura.items) return;
    const updatedItems = [...fatura.items];
    updatedItems.splice(index, 1);
    setFatura({ ...fatura, items: updatedItems });
  };

  const computeTotal = () => {
    return fatura.items?.reduce((acc, item) => acc + item.quantidade * item.precoUnitario * (1 + item.impostoPercent/100), 0) ?? 0;
  };

  const saveFatura = () => {
    const saved = localStorage.getItem('faturas');
    const list: Fatura[] = saved ? JSON.parse(saved) : [];
    const updated = [...list, { ...fatura, total: computeTotal() }];
    localStorage.setItem('faturas', JSON.stringify(updated));
    alert('Fatura criada com sucesso!');
    router.push('/dashboard/Faturas');
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-[#123859] mb-4">Nova Fatura</h1>
      <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Número</label>
          <input type="text" value={fatura.numero} onChange={e => handleChange('numero', e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block font-semibold">Cliente</label>
          <input type="text" value={fatura.cliente} onChange={e => handleChange('cliente', e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block font-semibold">Data</label>
          <input type="date" value={fatura.data} onChange={e => handleChange('data', e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block font-semibold">Vencimento</label>
          <input type="date" value={fatura.vencimento} onChange={e => handleChange('vencimento', e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block font-semibold">Status</label>
          <select value={fatura.status} onChange={e => handleChange('status', e.target.value)} className="border p-2 rounded w-full">
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Série</label>
          <input type="text" value={fatura.serie} onChange={e => handleChange('serie', e.target.value)} className="border p-2 rounded w-full" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-[#123859] mb-2">Itens</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        {fatura.items?.map((item, index) => (
          <div key={item.id} className="flex gap-2 mb-2 items-center">
            <input type="text" value={item.descricao} onChange={e => handleItemChange(index, 'descricao', e.target.value)} placeholder="Descrição" className="border p-2 rounded w-1/3" />
            <input type="number" value={item.quantidade} onChange={e => handleItemChange(index, 'quantidade', Number(e.target.value))} placeholder="Qtd" className="border p-2 rounded w-1/6" />
            <input type="number" value={item.precoUnitario} onChange={e => handleItemChange(index, 'precoUnitario', Number(e.target.value))} placeholder="Preço Unit" className="border p-2 rounded w-1/6" />
            <input type="number" value={item.impostoPercent} onChange={e => handleItemChange(index, 'impostoPercent', Number(e.target.value))} placeholder="% Imposto" className="border p-2 rounded w-1/6" />
            <div>€ {(item.quantidade * item.precoUnitario * (1 + item.impostoPercent/100)).toFixed(2)}</div>
            <button onClick={() => removeItem(index)} className="text-red-500 font-bold">X</button>
          </div>
        ))}
        <button onClick={addItem} className="mt-2 bg-[#F9941F] text-white px-3 py-1 rounded">Adicionar Item</button>
      </div>

      <div className="mb-4">
        <strong>Total: </strong> € {computeTotal().toFixed(2)}
      </div>

      <button onClick={saveFatura} className="bg-[#123859] text-white px-4 py-2 rounded">Salvar Fatura</button>
    </MainLayout>
  );
}
