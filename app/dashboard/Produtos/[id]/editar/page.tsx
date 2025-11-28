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

export default function EditarProduto() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error('Produto não encontrado');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.warn(err);
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

  const handleChange = (key: keyof Product, value: any) => setProduct(prev => prev ? { ...prev, [key]: value } : null);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      router.push('/dashboard/Produtos');
    } catch (err) {
      console.error(err);
      alert('Falha ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <MainLayout>Carregando...</MainLayout>;
  if (!product) return <MainLayout>Produto não encontrado</MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-[#123859] mb-4">Editar Produto</h1>
      <div className="flex flex-col gap-3 max-w-md">
        <input value={product.name} onChange={e => handleChange('name', e.target.value)} className="border p-2 rounded" placeholder="Nome"/>
        <input value={product.sku || ''} onChange={e => handleChange('sku', e.target.value)} className="border p-2 rounded" placeholder="SKU"/>
        <input type="number" value={product.price} onChange={e => handleChange('price', parseFloat(e.target.value))} className="border p-2 rounded" placeholder="Preço"/>
        <input type="number" value={product.stock} onChange={e => handleChange('stock', parseInt(e.target.value))} className="border p-2 rounded" placeholder="Stock"/>
        <textarea value={product.description} onChange={e => handleChange('description', e.target.value)} className="border p-2 rounded" placeholder="Descrição"/>
        <select value={product.category} onChange={e => handleChange('category', e.target.value)} className="border p-2 rounded">
          <option value="Produtos">Produtos</option>
          <option value="Serviços">Serviços</option>
          <option value="Consumíveis">Consumíveis</option>
          <option value="Outros">Outros</option>
        </select>
        <div className="flex gap-2 mt-4">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#F9941F] text-white rounded">{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </MainLayout>
  );
}
