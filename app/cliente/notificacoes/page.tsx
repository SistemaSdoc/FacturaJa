'use client';
import React, { useEffect, useState } from 'react';
import MainCliente from '../../components/MainCliente';
import { Bell, CreditCard, Gift, AlertCircle } from 'lucide-react';

interface Notificacao {
    id: number;
    tipo: 'fatura' | 'pagamento' | 'promocao' | 'alerta';
    texto: string;
    hora: string;
    lida: boolean;
}

export default function ClienteNotificationsPage() {
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [filtro, setFiltro] = useState<'Todas' | 'Lidas' | 'NaoLidas'>('Todas');

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => {
            setNotificacoes([
                { id: 1, tipo: 'fatura', texto: 'Nova fatura disponível', hora: '2h atrás', lida: false },
                { id: 2, tipo: 'pagamento', texto: 'Pagamento pendente', hora: '4h atrás', lida: true },
                { id: 3, tipo: 'promocao', texto: 'Promoção especial', hora: '1d atrás', lida: false },
                { id: 4, tipo: 'alerta', texto: 'Atualização de contrato', hora: '3d atrás', lida: true },
            ]);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const marcarComoLida = (id: number) => {
        setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    };

    const marcarComoNaoLida = (id: number) => {
        setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: false } : n));
    };

    if (!mounted) return null;
    if (loading) return <p className="p-6 text-center text-primary dark:text-primary">Carregando...</p>;

    const notificacoesFiltradas = notificacoes.filter(n => {
        if (filtro === 'Lidas') return n.lida;
        if (filtro === 'NaoLidas') return !n.lida;
        return true;
    });

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'fatura': return <CreditCard size={22} className="text-accent" />;
            case 'pagamento': return <Bell size={22} className="text-primary" />;
            case 'promocao': return <Gift size={22} className="text-primary" />;
            case 'alerta': return <AlertCircle size={22} className="text-red-500" />;
            default: return <Bell size={22} className="text-primary" />;
        }
    };

    return (
        <MainCliente>
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-primary dark:text-primary">Minhas Notificações</h1>
                    <div className="flex gap-3 items-center">
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value as any)}
                            className="px-3 py-2 rounded border border-gray-300 bg-bg dark:bg-surface text-primary dark:text-primary transition-colors"
                        >
                            <option value="Todas">Todas</option>
                            <option value="Lidas">Lidas</option>
                            <option value="NaoLidas">Não lidas</option>
                        </select>
                    </div>
                </div>

                {notificacoesFiltradas.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center">Nenhuma notificação encontrada.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {notificacoesFiltradas.map((n, idx) => (
                            <div
                                key={n.id}
                                className={`relative flex items-start gap-4 p-5 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 animate-fade-in bg-surface dark:bg-surface`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Barra lateral indicador de não lida */}
                                <div
                                    className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-all duration-300`}
                                    style={{ backgroundColor: n.lida ? 'transparent' : 'var(--accent)' }}
                                ></div>

                                <div className="flex flex-col flex-1 gap-2 ml-3">
                                    <div className="flex items-center gap-3 font-semibold text-lg text-primary dark:text-primary">
                                        {getIcon(n.tipo)}
                                        <span>{n.texto}</span>
                                    </div>
                                    <span className={`text-sm transition-colors duration-300 ${n.lida ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {n.hora}
                                    </span>

                                    <div className="mt-2 flex gap-2 flex-wrap">
                                        {!n.lida ? (
                                            <button
                                                onClick={() => marcarComoLida(n.id)}
                                                className="px-3 py-1 rounded-full border border-gray-300 bg-bg dark:bg-surface text-primary dark:text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Marcar como lida
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => marcarComoNaoLida(n.id)}
                                                className="px-3 py-1 rounded-full border border-gray-300 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Marcar como não lida
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.3s ease forwards;
                }
            `}</style>
        </MainCliente>
    );
}
