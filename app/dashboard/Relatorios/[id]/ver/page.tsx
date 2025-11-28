'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';

type Status = 'Pago' | 'Pendente' | 'Cancelada';

interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  serie: string;
  descricao?: string;
}

interface Payment {
  id: number;
  metodo: string;
  valor: number;
  data: string;
  status: string;
}

export default function VerFatura() {
  const { id } = useParams();
  const router = useRouter();

  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [pagamentos, setPagamentos] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchFatura = async () => {
      setLoading(true);
      setError('');
      try {
        if (!token) {
          // Mock
          const mockFatura: Fatura = {
            id: Number(id),
            numero: '001',
            cliente: 'João Silva',
            data: '2025-11-01',
            vencimento: '2025-11-10',
            total: 120,
            status: 'Pendente',
            serie: 'A',
            descricao: 'Serviços prestados em Novembro',
          };
          const mockPagamentos: Payment[] = [
            { id: 1, metodo: 'PIX', valor: 50, data: '2025-11-02', status: 'Conciliado' },
          ];
          setFatura(mockFatura);
          setPagamentos(mockPagamentos);
          return;
        }

        // Buscar fatura real
        const resF = await fetch(`/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resF.ok) throw new Error('Erro ao buscar fatura');
        const fData = await resF.json();
        setFatura(fData);

        const resP = await fetch(`/api/payments?invoiceId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resP.ok) throw new Error('Erro ao buscar pagamentos');
        const pData = await resP.json();
        setPagamentos(pData.items ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchFatura();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <MainLayout><p>Carregando...</p></MainLayout>;
  if (error) return <MainLayout><p className="text-red-500">{error}</p></MainLayout>;
  if (!fatura) return <MainLayout><p>Fatura não encontrada.</p></MainLayout>;

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const saldo = fatura.total - totalPago;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto p-4">
        <button onClick={() => router.back()} className="mb-4 px-4 py-2 border rounded hover:bg-gray-100">← Voltar</button>
        <h1 className="text-3xl font-bold text-[#123859] mb-4">Fatura #{fatura.numero}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>Cliente:</strong> {fatura.cliente}</p>
            <p><strong>Data:</strong> {fatura.data}</p>
            <p><strong>Vencimento:</strong> {fatura.vencimento}</p>
            <p><strong>Série:</strong> {fatura.serie}</p>
          </div>
          <div>
            <p><strong>Total:</strong> € {fatura.total.toFixed(2)}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${fatura.status === 'Pago' ? 'text-green-500' : fatura.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{fatura.status}</span></p>
            <p><strong>Total Pago:</strong> € {totalPago.toFixed(2)}</p>
            <p><strong>Saldo:</strong> € {saldo.toFixed(2)}</p>
          </div>
        </div>

        {fatura.descricao && (
          <div className="mb-4 p-3 bg-[#F2F2F2] rounded">
            <strong>Descrição:</strong>
            <p>{fatura.descricao}</p>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-[#123859] mb-2">Pagamentos</h2>
        {pagamentos.length === 0 ? (
          <p>Nenhum pagamento registrado para esta fatura.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="w-full">
              <thead className="bg-[#E5E5E5]">
                <tr>
                  <th className="p-2 text-left">Método</th>
                  <th className="p-2 text-left">Data</th>
                  <th className="p-2 text-right">Valor</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map(p => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{p.metodo}</td>
                    <td className="p-2">{p.data}</td>
                    <td className="p-2 text-right">€ {p.valor.toFixed(2)}</td>
                    <td className={`p-2 font-semibold ${p.status === 'Conciliado' ? 'text-green-500' : p.status === 'Pendente' ? 'text-yellow-500' : 'text-red-500'}`}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
