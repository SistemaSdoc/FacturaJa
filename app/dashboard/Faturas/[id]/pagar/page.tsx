'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

export default function PagarFaturaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [method, setMethod] = useState<'pix' | 'card' | 'boleto' | 'multicaixa'>('pix');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Simula carregamento da fatura (mock)
  useEffect(() => {
    if (!id) return;
  }, [id]);

  // Função totalmente mockada
  const handlePay = async () => {
    try {
      setLoading(true);
      setMessage('');

      // Simula demora de processamento (1.2s)
      await new Promise(res => setTimeout(res, 1200));

      // Após "processar"
      setMessage('Pagamento efetuado com sucesso.');

      // Redirecionar para ver a fatura mock
      setTimeout(() => {
        router.push(`/dashboard/Faturas/${id}/ver`);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setMessage('Erro inesperado ao simular pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#123859] mb-4">
          Pagar Fatura #{id}
        </h1>

        <div className="bg-white p-6 rounded shadow space-y-4">

          <div>
            <label className="block font-medium mb-2">Método de Pagamento</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full border p-2 rounded"
            >
              <option value="pix">Pix / Transferência</option>
              <option value="card">Cartão</option>
              <option value="boleto">Boleto</option>
              <option value="multicaixa">Multicaixa</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border rounded"
            >
              Voltar
            </button>

            <button
              onClick={handlePay}
              disabled={loading}
              className="px-4 py-2 bg-[#F9941F] text-white rounded"
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded ${
                message.includes('sucesso')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
