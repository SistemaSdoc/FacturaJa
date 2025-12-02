'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainCliente from '../../../../components/MainCliente';
import * as XLSX from 'xlsx';

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

  const handleExportExcel = () => {
    if (!fatura) return;

    const headerInfo = [
      { Informação: 'Número da Fatura', Valor: fatura.numero },
      { Informação: 'Cliente', Valor: fatura.cliente },
      { Informação: 'Data', Valor: fatura.data },
      { Informação: 'Vencimento', Valor: fatura.vencimento },
      { Informação: 'Status', Valor: fatura.status },
      {},
    ];

    const itemsData = fatura.items.map(item => ({
      Descrição: item.descricao,
      Quantidade: item.quantidade,
      'Preço Unitário (€)': item.precoUnitario.toFixed(2),
      'Imposto (%)': item.impostoPercent,
      Total: (item.quantidade * item.precoUnitario * (1 + item.impostoPercent/100)).toFixed(2)
    }));

    const totalsData = [
      {},
      { Descrição: 'Subtotal', Total: computeTotals(fatura.items).subtotal.toFixed(2) },
      { Descrição: 'Imposto', Total: computeTotals(fatura.items).imposto.toFixed(2) },
      { Descrição: 'Total', Total: computeTotals(fatura.items).total.toFixed(2) },
    ];

    const wsData = [...headerInfo, ...itemsData, ...totalsData];

    const ws = XLSX.utils.json_to_sheet(wsData, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Fatura ${fatura.numero}`);
    XLSX.writeFile(wb, `Fatura_${fatura.numero}.xlsx`);
  };

  if (loading) return <p className="p-6 text-center text-primary dark:text-primary">Carregando fatura...</p>;
  if (!fatura) return <p className="p-6 text-center text-red-500 dark:text-red-400">Fatura não encontrada.</p>;

  const totals = computeTotals(fatura.items);

  return (
    <MainCliente>
      <div className="bg-surface dark:bg-surface shadow rounded p-6 max-w-4xl mx-auto transition-colors duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-accent dark:text-accent">Fatura {fatura.numero}</h1>
          <span className={`mt-2 md:mt-0 px-3 py-1 rounded font-semibold ${
            fatura.status === 'Pago' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
            fatura.status === 'Pendente' ? 'bg-yellow-100 dark:bg-[#D9961A] text-yellow-600 dark:text-yellow-400' :
            'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
          }`}>
            {fatura.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-primary dark:text-primary">
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
          <p className="font-semibold text-primary dark:text-primary">Itens:</p>
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

        <div className="text-right mb-4 text-primary dark:text-primary">
          <p><strong>Subtotal:</strong> € {totals.subtotal.toFixed(2)}</p>
          <p><strong>Imposto:</strong> € {totals.imposto.toFixed(2)}</p>
          <p className="text-lg font-bold"><strong>Total:</strong> € {totals.total.toFixed(2)}</p>
        </div>

        {fatura.notas && (
          <div className="bg-bg dark:bg-bg p-2 rounded mb-4 text-primary dark:text-primary transition-colors duration-300">
            <p><strong>Notas:</strong> {fatura.notas}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-2 justify-end print:hidden">
          {fatura.status === 'Pendente' && (
            <button onClick={handlePay} className="bg-[#D9961A] text-[#F5F5F5] px-4 py-2 rounded hover:brightness-95 transition-colors duration-200">Pagar</button>
          )}
          <button onClick={handlePrint} className="bg-[#D9961A] text-[#F5F5F5] px-4 py-2 rounded hover:brightness-95 transition-colors duration-200">Imprimir</button>
          <button onClick={handleDownloadPDF} className="bg-[#D9961A] text-[#F5F5F5] px-4 py-2 rounded hover:brightness-95 transition-colors duration-200">Download PDF</button>
          <button onClick={handleExportExcel} className="bg-[#D9961A] text-[#F5F5F5] px-4 py-2 rounded hover:brightness-95 transition-colors duration-200">Exportar Excel</button>
        </div>

        <style jsx global>{`
          @media print {
            body, html {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .dark, body {
              background-color: var(--bg) !important;
              color: var(--text-on-dark) !important;
            }
            div, p, ul, li, table, th, td {
              background-color: inherit !important;
              color: inherit !important;
              border-color: #ccc !important;
            }
            button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </MainCliente>
  );
}
