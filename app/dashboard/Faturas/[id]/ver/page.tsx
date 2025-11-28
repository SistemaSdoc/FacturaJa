'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function VerFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [fatura, setFatura] = useState<Fatura | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('faturas');
    const list: Fatura[] = saved ? JSON.parse(saved) : [];
    const f = list.find(f => f.id === Number(id));
    if (f) setFatura(f);
  }, [id]);

  if (!fatura) return <MainLayout><p>Fatura não encontrada (mock)</p></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#123859]">Ver Fatura {fatura.numero}</h1>
          <div className="flex gap-2">
            <button onClick={() => router.push(`/dashboard/Faturas/${fatura.id}/editar`)} className="px-3 py-2 bg-orange-500 text-white rounded">Editar</button>
            <button onClick={() => router.back()} className="px-3 py-2 border rounded">Voltar</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Status: <span className={`font-semibold ${fatura.status==='Pago' ? 'text-green-500' : fatura.status==='Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{fatura.status}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Data: {fatura.data}</p>
              <p className="text-sm text-gray-500">Vencimento: {fatura.vencimento}</p>
              <p className="text-lg font-bold text-[#123859]">€ {Number(fatura.total).toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Cliente</h3>
            <p>{fatura.cliente}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Itens</h3>
            <div className="space-y-2">
              {fatura.items?.map(it => (
                <div key={it.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{it.descricao}</div>
                    <div className="text-sm text-gray-500">{it.quantidade} × €{it.precoUnitario.toFixed(2)} ({it.impostoPercent}% imposto)</div>
                  </div>
                  <div className="font-medium">€ {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent / 100)).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {fatura.notas && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Notas</h3>
              <p>{fatura.notas}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
