'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Por favor insira o seu email.');
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError('Email inválido.');
      return;
    }

    setLoading(true);
    try {
      // Ajuste o endpoint se o backend usar outro caminho
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        // tenta extrair mensagem do backend, senão genérica
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || 'Erro ao solicitar recuperação.');
      }

      // Por razões de segurança muitos backends devolvem a mesma mensagem
      setInfo('Se esse email existir na nossa base, você receberá instruções para redefinir a senha.');
      setEmail('');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro desconhecido. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-[#123859] mb-2">Recuperar senha</h1>
        <p className="text-sm text-gray-600 mb-4">
          Informe o email associado à sua conta. Enviaremos um link para redefinir a senha.
        </p>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {info && <div className="mb-3 text-sm text-green-600">{info}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#123859]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@exemplo.com"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F9941F]"
              aria-label="Email para recuperação"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#123859] text-white px-4 py-2 rounded hover:brightness-95 transition-colors duration-150"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <div className="mt-4 text-sm flex justify-between items-center">
          <Link href="/login" className="text-[#123859] hover:underline">Voltar ao login</Link>
          <Link href="/" className="text-gray-600 hover:underline">Voltar à home</Link>
        </div>
      </div>
    </div>
  );
}
