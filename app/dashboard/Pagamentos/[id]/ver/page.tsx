'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

interface Payment {
  id: number;
  reference: string;
  cliente?: string;
  data: string;
  metodo: string;
  valor: number;
  status: string;
  invoiceId?: number | null;
  nota?: string;
}

export default function VerPagamento() {
  const { id } = useParams(); // id do pagamento
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    // Aqui chamaria o backend /api/payments/:id
    // mock:
    setPayment({
      id: Number(id),
      reference: `PAY-2025-00${id}`,
      cliente: 'João Silva',
      data: '2025-11-20',
      metodo: 'PIX',
      valor: 150,
      status: 'Pendente',
      invoiceId: null,
      nota: 'Exemplo de nota',
    });
  }, [id]);

  if (!payment) return <MainLayout><p>Carregando...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Ver Pagamento #{payment.id}</h1>
        <p><strong>Referência:</strong> {payment.reference}</p>
        <p><strong>Cliente:</strong> {payment.cliente}</p>
        <p><strong>Data:</strong> {payment.data}</p>
        <p><strong>Método:</strong> {payment.metodo}</p>
        <p><strong>Valor:</strong> € {payment.valor.toFixed(2)}</p>
        <p><strong>Status:</strong> {payment.status}</p>
        <p><strong>Fatura:</strong> {payment.invoiceId ?? '—'}</p>
        <p><strong>Nota:</strong> {payment.nota}</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 border rounded">Voltar</button>
      </div>
    </MainLayout>
  );
}
