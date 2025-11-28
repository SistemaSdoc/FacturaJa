'use client';
import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';

interface Configuracoes {
  tema: 'Claro' | 'Escuro';
  idioma: 'Português' | 'Inglês';
  notificacoes: boolean;
  formatoData: string;
  moeda: string;
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Configuracoes>({
    tema: 'Claro',
    idioma: 'Português',
    notificacoes: true,
    formatoData: 'dd/mm/yyyy',
    moeda: 'EUR',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (field: keyof Configuracoes, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Simula API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Configurações do sistema salvas com sucesso!');
    } catch (err) {
      console.error(err);
      setMessage('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#123859]">Configurações do Sistema</h1>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded p-6 space-y-6">
        {/* Preferências do sistema */}
        <section>
          <h2 className="text-xl font-semibold text-[#123859] mb-4">Preferências</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={config.tema} onChange={e => handleChange('tema', e.target.value)} className="border p-2 rounded w-full">
              <option value="Claro">Claro</option>
              <option value="Escuro">Escuro</option>
            </select>

            <select value={config.idioma} onChange={e => handleChange('idioma', e.target.value)} className="border p-2 rounded w-full">
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
            </select>

            <select value={config.formatoData} onChange={e => handleChange('formatoData', e.target.value)} className="border p-2 rounded w-full">
              <option value="dd/mm/yyyy">dd/mm/yyyy</option>
              <option value="mm/dd/yyyy">mm/dd/yyyy</option>
              <option value="yyyy-mm-dd">yyyy-mm-dd</option>
            </select>

            <select value={config.moeda} onChange={e => handleChange('moeda', e.target.value)} className="border p-2 rounded w-full">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="AOA">AOA</option>
            </select>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={config.notificacoes} onChange={e => handleChange('notificacoes', e.target.checked)} />
              <label>Receber notificações</label>
            </div>
          </div>
        </section>

        {/* Ações */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={loading} className="bg-[#F9941F] text-white px-6 py-2 rounded hover:brightness-95">
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
