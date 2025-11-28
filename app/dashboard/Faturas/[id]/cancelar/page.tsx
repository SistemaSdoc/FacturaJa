'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

export default function CancelarFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleCancel = async () => {
    if (!token) { setMessage('Usuário não autenticado'); return; }
    if (!confirm('Tem certeza que deseja cancelar esta fatura? Esta ação pode ser irreversível conforme o seu backend.')) return;

    try {
      setLoading(true);
      setMessage('');
      const res = await fetch(`/api/invoices/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erro ao cancelar fatura');
      }
      setMessage('Fatura cancelada com sucesso.');
      setTimeout(() => router.push('/Dashboard/Faturas'), 1000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">Cancelar Fatura #{id}</h1>

        <div className="bg-white p-6 rounded shadow">
          <p className="mb-4">Ao cancelar a fatura, esta ficará com status <strong>Cancelada</strong>. Confirme abaixo.</p>

          <div className="flex justify-between">
            <button onClick={() => router.back()} className="px-4 py-2 border rounded">Voltar</button>
            <button onClick={handleCancel} disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded">
              {loading ? 'Aguarde...' : 'Cancelar Fatura'}
            </button>
          </div>

          {message && <div className={`mt-4 p-3 rounded ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
        </div>
      </div>
    </MainLayout>
  );
}
