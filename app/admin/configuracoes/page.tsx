'use client';
import React, { useEffect, useState } from 'react';
import MainAdmin from '../../components/MainAdmin';

export default function AdminConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [config, setConfig] = useState({
    siteName: 'FacturaJá',
    defaultCurrency: 'EUR',
    defaultLanguage: 'pt-PT',
    enableEmail: true,
    emailFrom: 'no-reply@facturaja.com',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    enableStripe: false,
    stripeKey: '',
    enableMulticaixa: true,
    multicaixaConfig: '',
    autoBackup: false,
    backupSchedule: 'daily', // daily | weekly | monthly
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      // tenta carregar da API /api/admin/config (se existir). fallback para mock
      try {
        if (token) {
          const res = await fetch('/api/admin/config', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setConfig(prev => ({ ...prev, ...data }));
          } else {
            // fallback: manter mock
            console.warn('API de config não respondeu, usando config local.');
          }
        } else {
          // sem token -> mock
        }
      } catch (err) {
        console.warn('Erro a buscar configurações (mock fallback):', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  function update<K extends keyof typeof config>(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function saveConfig() {
    setSaving(true);
    try {
      // validações básicas
      if (!config.siteName || !config.defaultCurrency) {
        setToast('Preenche o nome do site e a moeda padrão.');
        setSaving(false);
        setTimeout(() => setToast(''), 3000);
        return;
      }

      if (token) {
        const res = await fetch('/api/admin/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error('Erro ao salvar na API');
        setToast('Configurações guardadas com sucesso (API).');
      } else {
        // fallback mock: apenas simula sucesso
        setToast('Configurações guardadas localmente (mock).');
      }
    } catch (err) {
      console.error(err);
      setToast('Erro ao guardar configurações.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  }

  async function testEmail() {
    setSaving(true);
    try {
      if (!config.enableEmail) {
        setToast('Activa o email antes de testar.');
        setSaving(false);
        setTimeout(() => setToast(''), 2500);
        return;
      }
      if (token) {
        const res = await fetch('/api/admin/test-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ to: config.emailFrom }),
        });
        if (!res.ok) throw new Error('Erro no teste de email');
        setToast('Email de teste enviado com sucesso (API).');
      } else {
        // mock
        setToast('Email de teste simulado (mock).');
      }
    } catch (err) {
      console.error(err);
      setToast('Falha ao enviar email de teste.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  }

  async function backupNow() {
    setSaving(true);
    try {
      if (token) {
        const res = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erro no backup');
        setToast('Backup disparado (API).');
      } else {
        setToast('Backup simulado (mock).');
      }
    } catch (err) {
      console.error(err);
      setToast('Falha ao disparar backup.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  }

  if (loading) return (
    <MainAdmin>
      <div className="p-6 text-center">Carregando configurações...</div>
    </MainAdmin>
  );

  return (
    <MainAdmin>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#123859]">Configurações do Sistema</h1>

        {/* Geral */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Nome da aplicação</label>
              <input value={config.siteName} onChange={e => update('siteName', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Moeda padrão</label>
              <input value={config.defaultCurrency} onChange={e => update('defaultCurrency', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Idioma</label>
              <select value={config.defaultLanguage} onChange={e => update('defaultLanguage', e.target.value)} className="w-full border p-2 rounded">
                <option value="pt-PT">Português (PT)</option>
                <option value="pt-AO">Português (AO)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Auto backup</label>
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={config.autoBackup} onChange={e => update('autoBackup', e.target.checked)} />
                  <span>Ativar</span>
                </label>
                <select value={config.backupSchedule} onChange={e => update('backupSchedule', e.target.value)} className="border p-2 rounded">
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
                <button onClick={backupNow} className="px-3 py-1 bg-[#123859] text-white rounded">Backup agora</button>
              </div>
            </div>
          </div>
        </section>

        {/* Email / SMTP */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Email / SMTP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Habilitar envio de email</label>
              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={config.enableEmail} onChange={e => update('enableEmail', e.target.checked)} />
                  <span>Ativar SMTP</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email de remetente</label>
              <input value={config.emailFrom} onChange={e => update('emailFrom', e.target.value)} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="text-sm font-medium">SMTP Host</label>
              <input value={config.smtpHost} onChange={e => update('smtpHost', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Porta</label>
              <input type="number" value={config.smtpPort} onChange={e => update('smtpPort', Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">SMTP User</label>
              <input value={config.smtpUser} onChange={e => update('smtpUser', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">SMTP Password</label>
              <input value={config.smtpPass} onChange={e => update('smtpPass', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button onClick={testEmail} className="px-4 py-2 bg-[#F9941F] text-white rounded">Enviar email teste</button>
              <div className="text-sm text-gray-500 self-center">Use para testar se o SMTP está corretamente configurado.</div>
            </div>
          </div>
        </section>

        {/* Gateways de Pagamento */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Gateways de Pagamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Stripe</label>
              <div className="mt-2 flex items-center gap-3">
                <input type="checkbox" checked={config.enableStripe} onChange={e => update('enableStripe', e.target.checked)} />
                <input placeholder="Stripe Key (publishable/secret)" value={config.stripeKey} onChange={e => update('stripeKey', e.target.value)} className="w-full border p-2 rounded" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Multicaixa / Local</label>
              <div className="mt-2 flex items-center gap-3">
                <input type="checkbox" checked={config.enableMulticaixa} onChange={e => update('enableMulticaixa', e.target.checked)} />
                <input placeholder="Config Multicaixa" value={config.multicaixaConfig} onChange={e => update('multicaixaConfig', e.target.value)} className="w-full border p-2 rounded" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">As chaves e configurações reais só devem estar no backend — aqui guardamos apenas tokens/flags.</p>
        </section>

        {/* Ações finais */}
        <div className="flex justify-end gap-3">
          <button onClick={() => { setConfig({ siteName: 'FacturaJá', defaultCurrency: 'EUR', defaultLanguage: 'pt-PT', enableEmail: true, emailFrom: 'no-reply@facturaja.com', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', enableStripe: false, stripeKey: '', enableMulticaixa: true, multicaixaConfig: '', autoBackup: false, backupSchedule: 'daily' }); setToast('Restaurado defaults.'); setTimeout(()=>setToast(''), 2000); }} className="px-4 py-2 border rounded">Restaurar predefinidos</button>
          <button onClick={saveConfig} className="px-4 py-2 bg-[#123859] text-white rounded">{saving ? 'A gravar...' : 'Guardar configurações'}</button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow">
            {toast}
          </div>
        )}
      </div>
    </MainAdmin>
  );
}
