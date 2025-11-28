'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../components/MainLayout';

type PaymentMethod = 'Cartão' | 'PIX' | 'Multicaixa' | 'Transferência' | 'Boleto';
type PaymentStatus = 'Conciliado' | 'Pendente' | 'Estornado';

export default function NovoPagamento() {
    const router = useRouter();

    const [cliente, setCliente] = useState('');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [metodo, setMetodo] = useState<PaymentMethod>('PIX');
    const [valor, setValor] = useState<number>(0);
    const [status, setStatus] = useState<PaymentStatus>('Pendente');
    const [nota, setNota] = useState('');
    const [invoiceId, setInvoiceId] = useState<number | null>(null); // Estado corrigido

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSalvar = async () => {
        if (!valor || valor <= 0) {
            setError('Insira um valor válido.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Aqui você chamaria o backend para salvar
            const novoPagamento = {
                id: Date.now(), // ID único gerado localmente
                reference: `PAY-${Date.now()}`,
                cliente,
                data,
                metodo,
                valor,
                status,
                nota,
                invoiceId,
            };

            console.log('Pagamento registrado:', novoPagamento);

            // redireciona para a página de ver o pagamento
            router.push(`/dashboard/Pagamentos/ver/${novoPagamento.id}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao salvar pagamento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-[#123859] mb-4">Novo Pagamento</h1>

                {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-3">{error}</div>}
                {loading && <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-3">A salvar...</div>}

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Cliente (opcional)</label>
                        <input
                            type="text"
                            value={cliente}
                            onChange={e => setCliente(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Data</label>
                        <input
                            type="date"
                            value={data}
                            onChange={e => setData(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Método</label>
                        <select value={metodo} onChange={e => setMetodo(e.target.value as PaymentMethod)} className="border p-2 rounded w-full">
                            <option value="PIX">PIX</option>
                            <option value="Cartão">Cartão</option>
                            <option value="Multicaixa">Multicaixa</option>
                            <option value="Transferência">Transferência</option>
                            <option value="Boleto">Boleto</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Valor</label>
                        <input
                            type="number"
                            step="0.01"
                            value={valor}
                            onChange={e => setValor(Number(e.target.value))}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Fatura (opcional)</label>
                        <input
                            type="number"
                            placeholder="ID da fatura"
                            value={invoiceId ?? ''}
                            onChange={e => setInvoiceId(e.target.value ? Number(e.target.value) : null)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as PaymentStatus)} className="border p-2 rounded w-full">
                            <option value="Pendente">Pendente</option>
                            <option value="Conciliado">Conciliado</option>
                            <option value="Estornado">Estornado</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Nota (opcional)</label>
                        <input
                            type="text"
                            value={nota}
                            onChange={e => setNota(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button onClick={() => router.back()} className="px-4 py-2 border rounded">Cancelar</button>
                        <button onClick={handleSalvar} className="px-4 py-2 bg-[#F9941F] text-white rounded">{loading ? 'Aguarde...' : 'Salvar'}</button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
