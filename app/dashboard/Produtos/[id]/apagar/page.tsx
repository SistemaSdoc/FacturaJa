'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

type Product = {
  id: number;
  name: string;
};

export default function ApagarProduto() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Buscar produto real ou mock
    setProduct({ id, name: `Produto ${id}` });
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) throw new Error('Erro ao apagar');
      router.push('/dashboard/Produtos');
    } catch (err) {
      console.error(err);
      alert('Falha ao apagar produto');
    }
  };

  if (!product) return <MainLayout>Produto não encontrado</MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-[#123859] mb-4">Apagar Produto</h1>
      <p>Tem certeza que deseja apagar <strong>{product.name}</strong>?</p>
      <div className="flex gap-2 mt-4">
        <button onClick={() => router.back()} className="px-4 py-2 border rounded">Cancelar</button>
        <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">Apagar</button>
      </div>
    </MainLayout>
  );
}
