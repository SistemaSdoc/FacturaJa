'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

export default function ApagarPagamento() {
  const { id } = useParams();
  const router = useRouter();

  const handleApagar = () => {
    alert(`Pagamento ${id} apagado!`);
    router.push('/dashboard/Pagamentos'); // volta para a lista
  };

  return (
    <MainLayout>
      <div className="p-4 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Apagar Pagamento #{id}</h1>
        <p>Tem certeza que deseja apagar este pagamento?</p>
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={handleApagar} className="px-4 py-2 bg-red-500 text-white rounded">Apagar</button>
        </div>
      </div>
    </MainLayout>
  );
}
