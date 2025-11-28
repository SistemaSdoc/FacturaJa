'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';

type Product = {
  id: number;
  name: string;
  sku?: string;
  category?: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  imageFile?: File | null;
};

export default function ProdutosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{open: boolean; id?: number}>({open:false});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (token) {
          const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${token}` }});
          if (!res.ok) throw new Error('API de produtos indisponível (usando mock).');
          const data = await res.json();
          setProducts((data.items ?? data) as Product[]);
        } else {
          setProducts([
            { id: 1, name: 'Caderno A4', sku: 'CAD-A4', category: 'Produtos', price: 2.5, stock: 120, description: 'Caderno pautado 80 folhas' },
            { id: 3, name: 'Caneta Azul', sku: 'CAN-AZ', category: 'Consumíveis', price: 0.5, stock: 500, description: 'Caneta esferográfica' },
          ]);
        }
      } catch (err: any) {
        console.warn(err);
        setError(err.message || 'Erro ao carregar produtos. Mostrando mock.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    });
  }, [products, search]);

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const saveProduct = async (p: Product) => {
    setLoading(true);
    setError('');
    try {
      if (token) {
        const fd = new FormData();
        fd.append('name', p.name);
        if (p.sku) fd.append('sku', p.sku);
        fd.append('category', 'Produtos');
        fd.append('price', String(p.price));
        fd.append('stock', String(p.stock));
        if (p.description) fd.append('description', p.description);
        if ((p as any).imageFile) fd.append('image', (p as any).imageFile);
        const method = products.some(x => x.id === p.id) ? 'PUT' : 'POST';
        const url = method === 'POST' ? '/api/products' : `/api/products/${p.id}`;
        const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error('Erro ao salvar produto (API).');
        const saved = await res.json();
        setProducts(prev => {
          const without = prev.filter(x => x.id !== saved.id);
          return [saved, ...without];
        });
      } else {
        setProducts(prev => {
          const exists = prev.some(x => x.id === p.id);
          if (exists) return prev.map(x => x.id === p.id ? { ...p } : x);
          return [{ ...p }, ...prev];
        });
      }
      setEditing(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      if (token) {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error('Erro ao apagar produto (API).');
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      setConfirmDelete({open:false});
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao apagar produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilePick = (file?: File | null) => {
    if (!editing) return;
    const reader = file ? URL.createObjectURL(file) : null;
    setEditing({ ...editing, imageFile: file ?? null, imageUrl: reader ?? editing.imageUrl });
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      if (token) {
        await Promise.all(selected.map(id => fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })));
      }
      setProducts(prev => prev.filter(p => !selected.includes(p.id)));
      setSelected([]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao apagar selecionados.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportCsv = async (file?: File | null) => {
    if (!file) return;
    try {
      const text = await file!.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsed: Product[] = lines.map((ln, idx) => {
        const cols = ln.split(',');
        return {
          id: Date.now() + idx,
          name: (cols[0] || `Produto ${idx+1}`).trim(),
          sku: (cols[1]||'').trim(),
          category: 'Produtos',
          price: Number(cols[2] || 0),
          stock: Number(cols[3] || 0),
        };
      });
      setProducts(prev => [...parsed, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Falha a importar CSV.');
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#123859]">Produtos</h1>
          <p className="text-sm text-slate-600">Gerencie produtos — estoque, preço e categorias.</p>
        </div>
    
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-white border rounded px-3 py-2 cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => handleImportCsv(e.target.files?.[0] ?? undefined)}
            />
            <span className="text-sm text-[#123859]">Importar CSV</span>
          </label>
          <button onClick={() => router.push(`/dashboard/Produtos/novo`)} className="bg-[#F9941F] text-white px-4 py-2 rounded">+ Novo Produto</button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome / sku..." className="border p-2 rounded w-full md:w-1/3" />
        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={bulkDelete} className="px-3 py-2 bg-red-500 text-white rounded">Apagar ({selected.length})</button>
          </div>
        )}
      </div>

      {loading && <div className="p-4 bg-white rounded shadow mb-3">A carregar...</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded shadow p-4 flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-[#F2F2F2] rounded overflow-hidden flex items-center justify-center">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-500">Sem imagem</div>}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-[#123859]">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.sku}{p.category ? ` • ${p.category}` : ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">€ {Number(p.price).toFixed(2)}</div>
                    <div className={`text-sm ${p.stock <= 5 ? 'text-red-600' : 'text-gray-600'}`}>Stock: {p.stock}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-3">{p.description}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
              <button className="text-sm text-blue-500 hover:underline" onClick={() => router.push(`/dashboard/Produtos/${p.id}/ver`)}>Ver</button>
              <button className="text-sm text-orange-500 hover:underline" onClick={() => router.push(`/dashboard/Produtos/${p.id}/editar`)}>Editar</button>
              <button className="text-sm text-red-500 hover:underline" onClick={() => router.push(`/dashboard/Produtos/${p.id}/apagar`)}>Apagar</button>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
