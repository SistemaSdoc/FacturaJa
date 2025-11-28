'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

type Product = {
  id: number;
  name: string;
  sku?: string;
  category?: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
};

export default function VerProduto() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Exemplo de fetch real
        const res = await fetch(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error('Produto não encontrado');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.warn(err);
        // Mock caso API falhe
        setProduct({
          id,
          name: `Produto ${id}`,
          price: 10,
          stock: 5,
          description: 'Descrição de exemplo',
          category: 'Produtos',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <MainLayout>Carregando...</MainLayout>;
  if (!product) return <MainLayout>Produto não encontrado</MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-[#123859] mb-4">{product.name}</h1>
      <p className="text-sm text-gray-600 mb-2">SKU: {product.sku || '—'}</p>
      <p className="text-sm text-gray-600 mb-2">Categoria: {product.category}</p>
      <p className="text-sm text-gray-600 mb-2">Preço: € {product.price.toFixed(2)}</p>
      <p className="text-sm text-gray-600 mb-2">Stock: {product.stock}</p>
      <p className="text-sm text-gray-700 mb-4">{product.description}</p>
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-48 h-48 object-cover rounded mb-4" />}
      <button onClick={() => router.back()} className="px-4 py-2 bg-[#F9941F] text-white rounded">Voltar</button>
    </MainLayout>
  );
}
