'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

type Status = 'Pago' | 'Pendente' | 'Cancelada';

interface LineItem {
  id: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  impostoPercent: number;
}

interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  emailCliente?: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  serie: string;
  items?: LineItem[];
  notas?: string;
}

export default function EnviarFaturaPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id ?? '';

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      setLoading(true);
      setError('');
      try {
        if (!token) throw new Error('Usuário não autenticado');
        const res = await fetch(`/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar fatura');
        const data = await res.json();
        // Ajusta conforme o shape da tua API
        setFatura(data);
        // preencher email padrão / assunto / mensagem
        if (data.emailCliente) setToEmail(data.emailCliente);
        setSubject(`Fatura ${data.numero} — FacturaJá`);
        setMessage(`Olá ${data.cliente},\n\nSegue em anexo a fatura nº ${data.numero} no valor de €${Number(data.total).toFixed(2)}.\n\nAtenciosamente,\nFacturaJá`);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro desconhecido ao carregar fatura.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, token]);

  const handleSend = async () => {
    setError('');
    setSuccess('');
    if (!toEmail || !/\S+@\S+\.\S+/.test(toEmail)) {
      setError('Por favor insira um e-mail válido do destinatário.');
      return;
    }
    setSending(true);
    try {
      if (!token) throw new Error('Usuário não autenticado');
      // Chamada à API para enviar
      const res = await fetch(`/api/invoices/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toEmail, subject, message })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Erro ao enviar fatura');
      setSuccess('Fatura enviada com sucesso!');
      // opcional: atualizar estado local (marcar como enviado)
      // esperar 1.5s e voltar para a lista ou detalhe
      setTimeout(() => {
        router.push('/dashboard/Faturas');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao enviar fatura.');
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#123859]">Enviar Fatura</h1>
            <p className="text-sm text-slate-600">Envie a fatura por email ao cliente.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/dashboard/Faturas')} className="px-3 py-2 border rounded">Voltar</button>
          </div>
        </div>

        {loading && <div className="p-6 bg-white rounded shadow text-center">Carregando fatura...</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        {!loading && fatura && (
          <>
            <div className="bg-white p-4 rounded shadow mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">Fatura</div>
                  <div className="text-lg font-semibold text-[#123859]">#{fatura.numero} — Série {fatura.serie}</div>
                  <div className="text-sm text-gray-600">{fatura.cliente}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Data</div>
                  <div>{fatura.data}</div>
                  <div className="mt-2 text-sm text-gray-500">Vencimento</div>
                  <div>{fatura.vencimento}</div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Itens</h4>
                <ul className="space-y-2">
                  {(fatura.items ?? []).map(it => (
                    <li key={it.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{it.descricao}</div>
                        <div className="text-xs text-gray-500">{it.quantidade} × €{it.precoUnitario.toFixed(2)} ({it.impostoPercent}% impostos)</div>
                      </div>
                      <div className="font-medium">€ {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent/100)).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-end text-lg font-semibold">Total: € {Number(fatura.total).toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-3">Detalhes do envio</h3>

              <label className="block text-sm font-medium">Para (email)</label>
              <input
                className="w-full border p-2 rounded mb-3"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="cliente@exemplo.com"
              />

              <label className="block text-sm font-medium">Assunto</label>
              <input
                className="w-full border p-2 rounded mb-3"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />

              <label className="block text-sm font-medium">Mensagem</label>
              <textarea
                className="w-full border p-2 rounded mb-4"
                rows={6}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => router.push(`/dashboard/Faturas/${fatura.id}/editar`)} className="px-4 py-2 border rounded">Editar Fatura</button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="px-4 py-2 bg-[#F9941F] text-white rounded disabled:opacity-60"
                >
                  {sending ? 'Enviando...' : 'Enviar Fatura por Email'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
