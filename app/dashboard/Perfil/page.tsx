'use client';
import React, { useState } from 'react';
import MainLayout from '../../components/MainLayout';

interface Perfil {
  nomeEmpresa: string;
  nif: string;
  endereco: string;
  telefone: string;
  email: string;
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({
    nomeEmpresa: 'Minha Empresa Lda',
    nif: '123456789',
    endereco: 'Rua Exemplo, 123, Luanda',
    telefone: '+244 923 456 789',
    email: 'contato@empresa.com',
  });

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (field: keyof Perfil, value: any) => {
    setPerfil(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePerfil = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Simula API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Dados do perfil salvos com sucesso!');
    } catch (err) {
      console.error(err);
      setMessage('Erro ao salvar dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setMessage('');
    if (novaSenha !== confirmaSenha) {
      setMessage('Nova senha e confirmação não coincidem.');
      setLoading(false);
      return;
    }
    try {
      // Simula API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaSenha('');
    } catch (err) {
      console.error(err);
      setMessage('Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#123859]">Perfil da Empresa</h1>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {message}
        </div>
      )}

      {/* Dados da empresa */}
      <div className="bg-white shadow rounded p-6 mb-6 space-y-4">
        <h2 className="text-xl font-semibold text-[#123859] mb-4">Informações da Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome da Empresa"
            value={perfil.nomeEmpresa}
            onChange={e => handleChange('nomeEmpresa', e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="NIF"
            value={perfil.nif}
            onChange={e => handleChange('nif', e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Endereço"
            value={perfil.endereco}
            onChange={e => handleChange('endereco', e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Telefone"
            value={perfil.telefone}
            onChange={e => handleChange('telefone', e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={perfil.email}
            onChange={e => handleChange('email', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="flex justify-end">
          <button onClick={handleSavePerfil} disabled={loading} className="bg-[#F9941F] text-white px-6 py-2 rounded hover:brightness-95">
            {loading ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      </div>

      {/* Alterar senha */}
      <div className="bg-white shadow rounded p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[#123859] mb-4">Alterar Senha</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="password"
            placeholder="Senha Atual"
            value={senhaAtual}
            onChange={e => setSenhaAtual(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Nova Senha"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Confirmar Nova Senha"
            value={confirmaSenha}
            onChange={e => setConfirmaSenha(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="flex justify-end">
          <button onClick={handleChangePassword} disabled={loading} className="bg-[#F9941F] text-white px-6 py-2 rounded hover:brightness-95">
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
