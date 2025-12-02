'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainCliente from '../../../../components/MainCliente';

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
}

export default function PayInvoicePage() {
  const { public_id } = useParams();
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [metodo, setMetodo] = useState<'Pix' | 'Cartão' | 'Boleto'>('Pix');

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

  const handlePay = () => {
    alert(`Simulando pagamento via ${metodo} de €${fatura?.total.toFixed(2)}`);
  };

  if (loading) return <p className="p-6 text-center text-primary dark:text-primary">Carregando fatura...</p>;
  if (!fatura) return <p className="p-6 text-center text-red-500 dark:text-red-400">Fatura não encontrada.</p>;

  const totals = computeTotals(fatura.items);

  return (
    <MainCliente>
      <div className="bg-surface dark:bg-surface shadow rounded p-6 max-w-4xl mx-auto transition-colors duration-300">
        <h1 className="text-2xl font-bold text-accent dark:text-accent mb-4">Pagar Fatura {fatura.numero}</h1>

        <div className="mb-4 text-primary dark:text-primary">
          <p><strong>Cliente:</strong> {fatura.cliente}</p>
          <p><strong>Data / Vencimento:</strong> {fatura.data} / {fatura.vencimento}</p>
        </div>

        <div className="mb-4">
          <p className="font-semibold text-primary dark:text-primary mb-2">Itens:</p>
          <ul className="mt-2 space-y-2">
            {fatura.items.map(it => (
              <li key={it.id} className="flex justify-between bg-bg dark:bg-bg p-2 rounded transition-colors duration-300">
                <div>
                  <div className="font-medium text-primary dark:text-primary">{it.descricao}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{it.quantidade} × €{it.precoUnitario.toFixed(2)} ({it.impostoPercent}% imposto)</div>
                </div>
                <div className="text-primary dark:text-primary">€ {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent/100)).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-right mb-6 text-primary dark:text-primary">
          <p><strong>Subtotal:</strong> € {totals.subtotal.toFixed(2)}</p>
          <p><strong>Imposto:</strong> € {totals.imposto.toFixed(2)}</p>
          <p className="text-lg font-bold"><strong>Total:</strong> € {totals.total.toFixed(2)}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-2 text-primary dark:text-primary">Escolher método de pagamento:</p>
          <div className="flex flex-col md:flex-row gap-2">
            {['Pix', 'Cartão', 'Boleto'].map(m => (
              <button
                key={m}
                onClick={() => setMetodo(m as 'Pix' | 'Cartão' | 'Boleto')}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  metodo === m
                    ? 'bg-[#D9961A] text-[#F5F5F5]'
                    : 'bg-surface dark:bg-[#D9961A] text-[#F5F5F5] dark:text-primary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePay}
            className="bg-primary dark:bg-[#D9961A] text-white px-6 py-2 rounded hover:brightness-95 transition-colors duration-200"
          >
            Pagar €{fatura.total.toFixed(2)}
          </button>
        </div>
      </div>
    </MainCliente>
  );
}
