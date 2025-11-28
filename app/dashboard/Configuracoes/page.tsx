'use client';
import React, { useState, useEffect } from 'react';
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

  // Efeito de transição de tema
  useEffect(() => {
    const root = document.documentElement;
    if (config.tema === 'Escuro') {
      root.style.setProperty('--bg-base', '#0A0A0A');
      root.style.setProperty('--bg-card', '#171717');
      root.style.setProperty('--text-primary', '#A1A1A1');
      root.style.setProperty('--text-highlight', '#D9961A');
      root.style.setProperty('--bg-hover', '#0D0D0D');
      root.style.setProperty('--btn-active', '#D9961A');
      root.style.setProperty('--btn-text-dark', '#0D0D0D');
    } else {
root.style.setProperty('--bg-base', '#F2F2F2');      // fundo da página
    root.style.setProperty('--bg-card', '#E5E5E5');      // fundo dos cards
    root.style.setProperty('--text-primary', '#123859'); // texto normal
    root.style.setProperty('--text-highlight', '#F9941F'); // textos/títulos de destaque
    root.style.setProperty('--bg-hover', '#F2F2F2');     // hover dos cards ou inputs
    root.style.setProperty('--btn-active', '#F9941F');   // cor principal de botões
    root.style.setProperty('--btn-text-dark', '#FFFFFF');
    }
  }, [config.tema]);

  const handleChange = (field: keyof Configuracoes, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Configurações do sistema salvas com sucesso!');
    } catch (err) {
      console.error(err);
      setMessage('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = config.tema === 'Escuro';

  const cardClass = `p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl bg-[var(--bg-card)]`;

  return (
    <MainLayout>
      <div className="mb-6 transition-colors duration-500">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-highlight)' }}>Configurações do Sistema</h1>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--btn-active)', color: 'var(--btn-text-dark)' }}>
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tema */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-highlight)' }}>Tema do Sistema</h2>
          <div className="flex gap-4">
            {['Claro', 'Escuro'].map(t => (
              <button
                key={t}
                onClick={() => handleChange('tema', t)}
                className={`px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${
                  config.tema === t
                    ? 'bg-[var(--btn-active)] text-[var(--btn-text-dark)]'
                    : 'bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--text-highlight)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Idioma */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-highlight)' }}>Idioma</h2>
          <select
            value={config.idioma}
            onChange={e => handleChange('idioma', e.target.value)}
            className="border p-2 rounded w-full md:w-2/3 focus:outline-none focus:ring-2 focus:ring-[var(--text-highlight)] bg-[var(--bg-base)] text-[var(--text-primary)]"
          >
            <option value="Português">Português</option>
            <option value="Inglês">Inglês</option>
          </select>
        </div>

        {/* Formato da data */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-highlight)' }}>Formato da Data</h2>
          <select
            value={config.formatoData}
            onChange={e => handleChange('formatoData', e.target.value)}
            className="border p-2 rounded w-full md:w-2/3 focus:outline-none focus:ring-2 focus:ring-[var(--text-highlight)] bg-[var(--bg-base)] text-[var(--text-primary)]"
          >
            <option value="dd/mm/yyyy">dd/mm/yyyy</option>
            <option value="mm/dd/yyyy">mm/dd/yyyy</option>
            <option value="yyyy-mm-dd">yyyy-mm-dd</option>
          </select>
        </div>

        {/* Moeda */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-highlight)' }}>Moeda</h2>
          <select
            value={config.moeda}
            onChange={e => handleChange('moeda', e.target.value)}
            className="border p-2 rounded w-full md:w-2/3 focus:outline-none focus:ring-2 focus:ring-[var(--text-highlight)] bg-[var(--bg-base)] text-[var(--text-primary)]"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="AOA">AOA</option>
          </select>
        </div>

        {/* Notificações */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-highlight)' }}>Notificações</h2>
          <div
            onClick={() => handleChange('notificacoes', !config.notificacoes)}
            className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
              config.notificacoes ? 'bg-[var(--btn-active)]' : 'bg-gray-500'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                config.notificacoes ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </div>
          <p className="mt-1 text-[var(--text-primary)]">{config.notificacoes ? 'Ativas' : 'Desativadas'}</p>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:brightness-105"
          style={{
            backgroundColor: 'var(--btn-active)',
            color: 'var(--btn-text-dark)',
          }}
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </MainLayout>
  );
}
