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

export default function EditarClientePage() {
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

  const handleChange = (field: keyof Cliente, value: any) => {
    if (!cliente) return;
    setCliente({ ...cliente, [field]: value });
  };

  const salvarCliente = () => {
    alert('Cliente salvo com sucesso (mock)!');
    router.push('/dashboard/Clientes');
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-[#123859] mb-4">Editar Cliente: {cliente.nome}</h1>
      <div className="bg-white p-6 rounded shadow space-y-4">
        <input type="text" value={cliente.nome} onChange={e => handleChange('nome', e.target.value)} className="border p-2 rounded w-full" placeholder="Nome"/>
        <input type="email" value={cliente.email} onChange={e => handleChange('email', e.target.value)} className="border p-2 rounded w-full" placeholder="Email"/>
        <input type="text" value={cliente.telefone} onChange={e => handleChange('telefone', e.target.value)} className="border p-2 rounded w-full" placeholder="Telefone"/>
        <input type="text" value={cliente.empresa} onChange={e => handleChange('empresa', e.target.value)} className="border p-2 rounded w-full" placeholder="Empresa"/>
        <select value={cliente.status} onChange={e => handleChange('status', e.target.value)} className="border p-2 rounded w-full">
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => router.push('/dashboard/Clientes')} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={salvarCliente} className="px-4 py-2 bg-[#F9941F] text-white rounded">Salvar</button>
        </div>
      </div>
    </MainLayout>
  );
}
