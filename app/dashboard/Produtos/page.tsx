'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '../../components/MainLayout';

type Product = {
  id: number;
  name: string;
  sku?: string;
  category?: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string; // quando vier da API
  imageFile?: File | null; // local only
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  // Modal / form
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{open: boolean; id?: number}>({open:false});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // categories mock (pode vir da API)
  const categories = useMemo(() => ['Todos','Serviços','Produtos','Consumíveis','Outros'], []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // MOCK inicial — substitui com fetch /api/products
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (token) {
          // tentar buscar produtos reais
          const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${token}` }});
          if (!res.ok) throw new Error('API de produtos indisponível (usando mock).');
          const data = await res.json();
          // espera-se data.items ou data
          setProducts((data.items ?? data) as Product[]);
        } else {
          // mock local
          setProducts([
            { id: 1, name: 'Caderno A4', sku: 'CAD-A4', category: 'Produtos', price: 2.5, stock: 120, description: 'Caderno pautado 80 folhas' },
            { id: 2, name: 'Serviço de Impressão', sku: 'SRV-IMP', category: 'Serviços', price: 5.0, stock: 99999, description: 'Impressão a cores por página' },
            { id: 3, name: 'Caneta Azul', sku: 'CAN-AZ', category: 'Consumíveis', price: 0.5, stock: 500, description: 'Caneta esferográfica' },
          ]);
        }
      } catch (err: any) {
        console.warn(err);
        setError(err.message || 'Erro ao carregar produtos. Mostrando mock.');
        // fallback a mock se quiseres
        if (!products.length) {
          setProducts([
            { id: 1, name: 'Caderno A4', sku: 'CAD-A4', category: 'Produtos', price: 2.5, stock: 120, description: 'Caderno pautado 80 folhas' },
            { id: 2, name: 'Serviço de Impressão', sku: 'SRV-IMP', category: 'Serviços', price: 5.0, stock: 99999, description: 'Impressão a cores por página' },
            { id: 3, name: 'Caneta Azul', sku: 'CAN-AZ', category: 'Consumíveis', price: 0.5, stock: 500, description: 'Caneta esferográfica' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter && categoryFilter !== 'Todos' && p.category !== categoryFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    });
  }, [products, search, categoryFilter]);

  // seleção em massa
  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // abrir modal de criação
  const openCreate = () => {
    setEditing({ id: Date.now(), name: '', sku: '', category: 'Produtos', price: 0, stock: 0, description: '', imageFile: null });
    setFormOpen(true);
  };

  // editar
  const openEdit = (p: Product) => {
    setEditing({ ...p, imageFile: null }); // imageFile só para editar localmente
    setFormOpen(true);
  };

  // salvar produto (POST ou PUT)
  const saveProduct = async (p: Product) => {
    setLoading(true);
    setError('');
    try {
      if (token) {
        // enviar como FormData para permitir upload de imagem
        const fd = new FormData();
        fd.append('name', p.name);
        if (p.sku) fd.append('sku', p.sku);
        if (p.category) fd.append('category', p.category);
        fd.append('price', String(p.price));
        fd.append('stock', String(p.stock));
        if (p.description) fd.append('description', p.description);
        if ((p as any).imageFile) fd.append('image', (p as any).imageFile);
        const method = products.some(x => x.id === p.id) ? 'PUT' : 'POST';
        const url = method === 'POST' ? '/api/products' : `/api/products/${p.id}`;
        const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error('Erro ao salvar produto (API).');
        const saved = await res.json();
        // atualiza lista com resposta da API
        setProducts(prev => {
          const without = prev.filter(x => x.id !== saved.id);
          return [saved, ...without];
        });
      } else {
        // modo local mock
        setProducts(prev => {
          const exists = prev.some(x => x.id === p.id);
          if (exists) return prev.map(x => x.id === p.id ? { ...p } : x);
          return [{ ...p }, ...prev];
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  // deletar um produto
  const deleteProduct = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      if (token) {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error('Erro ao apagar produto (API).');
        // opcional: ler body
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

  // handle file selection for editing form
  const handleFilePick = (file?: File | null) => {
    if (!editing) return;
    const reader = file ? URL.createObjectURL(file) : null;
    setEditing({ ...editing, imageFile: file ?? null, imageUrl: reader ?? editing.imageUrl });
  };

  // bulk delete (ex.: apagar selecionados)
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

  // upload CSV (placeholder — só lê localmente)
  const handleImportCsv = async (file?: File | null) => {
    if (!file) return;
    try {
      const text = await file!.text();
      // parse CSV simples: name,sku,category,price,stock
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsed: Product[] = lines.map((ln, idx) => {
        const cols = ln.split(',');
        return {
          id: Date.now() + idx,
          name: (cols[0] || `Produto ${idx+1}`).trim(),
          sku: (cols[1]||'').trim(),
          category: (cols[2]||'Produtos').trim(),
          price: Number(cols[3] || 0),
          stock: Number(cols[4] || 0),
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
          <p className="text-sm text-slate-600">Gerencie produtos e serviços — estoque, preço e categorias.</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#123859]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="text-sm text-[#123859]">Importar CSV</span>
          </label>

          <button onClick={openCreate} className="bg-[#F9941F] text-white px-4 py-2 rounded">+ Novo Produto</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome / sku..." className="border p-2 rounded w-full md:w-1/3" />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border p-2 rounded w-full md:w-1/5">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

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
              <button onClick={() => setViewing(p)} className="text-sm text-blue-500 hover:underline">Ver</button>
              <button onClick={() => openEdit(p)} className="text-sm text-orange-500 hover:underline">Editar</button>
              <button onClick={() => setConfirmDelete({open:true, id: p.id})} className="text-sm text-red-500 hover:underline">Apagar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizar produto */}
      {viewing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded shadow p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[#123859]">{viewing.name}</h2>
                <div className="text-sm text-gray-500">{viewing.sku} • {viewing.category}</div>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-500">Fechar</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <div className="w-full h-40 bg-[#F2F2F2] rounded overflow-hidden flex items-center justify-center">
                  {viewing.imageUrl ? <img src={viewing.imageUrl} alt={viewing.name} className="w-full h-full object-cover" /> : <div className="text-sm text-gray-500">Sem imagem</div>}
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-700 mb-2">{viewing.description}</p>
                <div className="flex justify-between mt-4">
                  <div>
                    <div className="text-xs text-gray-500">Preço</div>
                    <div className="font-bold">€ {Number(viewing.price).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Stock</div>
                    <div className="font-bold">{viewing.stock}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setViewing(null); openEdit(viewing); }} className="px-4 py-2 border rounded">Editar</button>
              <button onClick={() => setViewing(null)} className="px-4 py-2 bg-[#F9941F] text-white rounded">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form (create/edit) */}
      {formOpen && editing && (
        <ProductForm
          product={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={(p) => saveProduct(p)}
          onPickImage={(file) => handleFilePick(file)}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete.open && confirmDelete.id && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="text-lg font-semibold text-[#123859] mb-2">Confirmar remoção</h3>
            <p className="mb-4">Tem a certeza que deseja apagar este produto?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete({open:false})} className="px-3 py-2 border rounded">Cancelar</button>
              <button onClick={() => deleteProduct(confirmDelete.id!)} className="px-3 py-2 bg-red-500 text-white rounded">Apagar</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

/* ---------- ProductForm component (interno, reutilizável) ---------- */
function ProductForm({ product, onClose, onSave, onPickImage }: { product: Product; onClose: ()=>void; onSave: (p: Product)=>void; onPickImage: (f?: File|null)=>void; }) {
  const [p, setP] = useState<Product>(product);
  const [preview, setPreview] = useState<string | undefined>(product.imageUrl);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // revoke object urls cleanup
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pickFile = (file?: File | null) => {
    if (!file) {
      setPreview(undefined);
      onPickImage(null);
      setP(prev => ({ ...prev, imageFile: null, imageUrl: undefined }));
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onPickImage(file);
    setP(prev => ({ ...prev, imageFile: file }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-16 z-50">
      <div className="bg-white rounded p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#123859]">{product && product.name ? 'Editar produto' : 'Novo produto'}</h2>
          <button onClick={onClose} className="text-gray-600">Fechar</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input className="w-full border p-2 rounded" value={p.name} onChange={e => setP({...p, name: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">SKU</label>
            <input className="w-full border p-2 rounded" value={p.sku} onChange={e => setP({...p, sku: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Categoria</label>
            <input className="w-full border p-2 rounded" value={p.category} onChange={e => setP({...p, category: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Preço (€)</label>
            <input type="number" step="0.01" className="w-full border p-2 rounded" value={p.price} onChange={e => setP({...p, price: Number(e.target.value) || 0})} />
          </div>
          <div>
            <label className="text-sm font-medium">Stock</label>
            <input type="number" className="w-full border p-2 rounded" value={p.stock} onChange={e => setP({...p, stock: Number(e.target.value) || 0})} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Imagem</label>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-24 h-24 bg-[#F2F2F2] rounded overflow-hidden flex items-center justify-center">
                {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <div className="text-xs text-gray-500">Sem imagem</div>}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={e => pickFile(e.target.files?.[0] ?? undefined)} />
                <div className="flex gap-2">
                  <button onClick={() => inputFileRef.current && inputFileRef.current.click()} className="px-3 py-2 border rounded">Escolher</button>
                  <button onClick={() => pickFile(null)} className="px-3 py-2 border rounded">Remover</button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea className="w-full border p-2 rounded" rows={4} value={p.description} onChange={e => setP({...p, description: e.target.value})} />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={() => onSave(p)} className="px-4 py-2 bg-[#F9941F] text-white rounded">Salvar</button>
        </div>
      </div>
    </div>
  );
}
