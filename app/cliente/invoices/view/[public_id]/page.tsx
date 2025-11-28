'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainCliente from '../../../../components/MainCliente'; // ajuste o caminho conforme a pasta

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
  items: LineItem[];
  notas?: string;
}

export default function ViewInvoicePage() {
  const { public_id } = useParams();
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const mockFatura: Fatura = {
      id: Number(public_id),
      numero: '001',
      cliente: 'João Silva',
      data: '2025-11-01',
      vencimento: '2025-11-10',
      total: 120,
      status: 'Pendente',
      items: [
        { id: 1, descricao: 'Produto A', quantidade: 2, precoUnitario: 30, impostoPercent: 0 },
        { id: 2, descricao: 'Serviço B', quantidade: 1, precoUnitario: 60, impostoPercent: 0 },
      ],
      notas: 'Obrigado pelo seu pagamento.'
    };
    setTimeout(() => {
      setFatura(mockFatura);
      setLoading(false);
    }, 500);
  }, [public_id]);

  const computeTotals = (items: LineItem[]) => {
    let subtotal = 0, imposto = 0;
    items.forEach(i => {
      const line = i.quantidade * i.precoUnitario;
      subtotal += line;
      imposto += line * (i.impostoPercent / 100);
    });
    return { subtotal, imposto, total: subtotal + imposto };
  };

  const handlePrint = () => window.print();
  const handleDownloadPDF = () => alert('Simular download PDF');
  const handlePay = () => alert('Simular pagamento (abrir checkout)');

  if (loading) return <p className="p-6 text-center">Carregando fatura...</p>;
  if (!fatura) return <p className="p-6 text-center text-red-500">Fatura não encontrada.</p>;

  const totals = computeTotals(fatura.items);

  return (
    <MainCliente>
      <div className="bg-white shadow rounded p-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-[#123859]">Fatura {fatura.numero}</h1>
          <span className={`mt-2 md:mt-0 px-3 py-1 rounded font-semibold ${
            fatura.status === 'Pago' ? 'bg-green-100 text-green-600' :
            fatura.status === 'Pendente' ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            {fatura.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>Cliente</strong></p>
            <p>{fatura.cliente}</p>
          </div>
          <div>
            <p><strong>Data / Vencimento</strong></p>
            <p>{fatura.data} / {fatura.vencimento}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-semibold">Itens:</p>
          <ul className="mt-2 space-y-2">
            {fatura.items.map(it => (
              <li key={it.id} className="flex justify-between bg-[#F2F2F2] p-2 rounded">
                <div>
                  <div className="font-medium">{it.descricao}</div>
                  <div className="text-sm text-gray-500">{it.quantidade} × €{it.precoUnitario.toFixed(2)} ({it.impostoPercent}% imposto)</div>
                </div>
                <div>€ {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent/100)).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-right mb-4">
          <p><strong>Subtotal:</strong> € {totals.subtotal.toFixed(2)}</p>
          <p><strong>Imposto:</strong> € {totals.imposto.toFixed(2)}</p>
          <p className="text-lg font-bold"><strong>Total:</strong> € {totals.total.toFixed(2)}</p>
        </div>

        {fatura.notas && (
          <div className="bg-[#E5E5E5] p-2 rounded mb-4">
            <p><strong>Notas:</strong> {fatura.notas}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-2 justify-end">
          {fatura.status === 'Pendente' && (
            <button onClick={handlePay} className="bg-[#F9941F] text-white px-4 py-2 rounded hover:brightness-95">Pagar</button>
          )}
          <button onClick={handlePrint} className="bg-[#123859] text-white px-4 py-2 rounded hover:brightness-95">Imprimir</button>
          <button onClick={handleDownloadPDF} className="bg-gray-500 text-white px-4 py-2 rounded hover:brightness-95">Download PDF</button>
        </div>
      </div>
    </MainCliente>
  );
}
