'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

export default function ApagarClientePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const apagarCliente = () => {
    alert(`Cliente ${id} apagado (mock)!`);
    router.push('/dashboard/Clientes');
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-red-500 mb-4">Apagar Cliente</h1>
      <p>Tem certeza que deseja apagar o cliente de ID {id}?</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => router.push('/dashboard/Clientes')} className="px-4 py-2 border rounded">Cancelar</button>
        <button onClick={apagarCliente} className="px-4 py-2 bg-red-500 text-white rounded">Apagar</button>
      </div>
    </MainLayout>
  );
}
