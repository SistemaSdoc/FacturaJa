'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  status: 'Ativo' | 'Inativo';
}

export default function VerClientePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);

  const mockClientes: Cliente[] = [
    { id: 1, nome: 'João Silva', email: 'joao@gmail.com', telefone: '912345678', empresa: 'Empresa A', status: 'Ativo' },
    { id: 2, nome: 'Maria Santos', email: 'maria@gmail.com', telefone: '923456789', empresa: 'Empresa B', status: 'Ativo' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@gmail.com', telefone: '934567890', empresa: 'Empresa C', status: 'Inativo' },
  ];

  useEffect(() => {
    const c = mockClientes.find(c => c.id === Number(id));
    if (c) setCliente(c);
  }, [id]);

  if (!cliente) return <MainLayout><p className="text-red-500">Cliente não encontrado.</p></MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-[#123859] mb-4">Cliente: {cliente.nome}</h1>
      <div className="bg-white p-6 rounded shadow space-y-2">
        <p><strong>Email:</strong> {cliente.email}</p>
        <p><strong>Telefone:</strong> {cliente.telefone}</p>
        <p><strong>Empresa:</strong> {cliente.empresa}</p>
        <p><strong>Status:</strong> {cliente.status}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => router.push('/dashboard/Clientes')} className="px-4 py-2 border rounded">Voltar</button>
        <button onClick={() => router.push(`/dashboard/Clientes/${id}/editar`)} className="px-4 py-2 bg-[#F9941F] text-white rounded">Editar</button>
        <button onClick={() => router.push(`/dashboard/Clientes/${id}/apagar`)} className="px-4 py-2 bg-red-500 text-white rounded">Apagar</button>
      </div>
    </MainLayout>
  );
}
