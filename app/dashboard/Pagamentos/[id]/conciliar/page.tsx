'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

export default function ConciliarPagamento() {
  const { id } = useParams();
  const router = useRouter();
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  const handleConciliar = () => {
    alert(`Pagamento ${id} conciliado com fatura #${invoiceId}`);
    router.back();
  };

  return (
    <MainLayout>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Conciliar Pagamento #{id}</h1>
        <label className="block mb-2">Id da Fatura</label>
        <input type="number" value={invoiceId ?? ''} onChange={e => setInvoiceId(Number(e.target.value))} className="border p-2 rounded w-full mb-4" />
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={handleConciliar} className="px-4 py-2 bg-[#F9941F] text-white rounded" disabled={!invoiceId}>Conciliar</button>
        </div>
      </div>
    </MainLayout>
  );
}
