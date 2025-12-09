'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getUser,
  getEmpresaAuth,
  normalizeLogoUrl
} from '../services/axios'; // ajusta o path se necessário

type User = any;
type Empresa = {
  id?: number;
  nome?: string;
  slug?: string;
  logo?: string | null;
  email?: string;
  telefone?: string;
  endereco?: string;
  [k: string]: any;
};

type AuthContextValue = {
  user: User | null;
  empresa: Empresa | null;
  loading: boolean;
  login: (email: string, pass: string, slug: string) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega user + empresa ao montar (se estiver autenticado via cookie/Sanctum)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const u = await getUser(); // usa endpoint /dashboard que tu tens
        const e = await getEmpresaAuth();
        if (!mounted) return;
        setUser(u ?? null);
        setEmpresa(e ?? null);
      } catch (err) {
        if (!mounted) return;
        setUser(null);
        setEmpresa(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Faz login: usa a função do axios (que já pega CSRF)
  async function login(email: string, password: string, empresa_slug: string) {
    const data = await apiLogin(email, password, empresa_slug);
    // Se a API retornar user/empresa no corpo, usa-os; caso contrário recarrega via endpoints
    if (data?.user) setUser(data.user);
    if (data?.empresa) setEmpresa(data.empresa);
    // se API não retornar, tenta buscar:
    if (!data?.user) {
      try {
        const u = await getUser();
        setUser(u ?? null);
      } catch {}
    }
    if (!data?.empresa) {
      try {
        const e = await getEmpresaAuth();
        setEmpresa(e ?? null);
      } catch {}
    }
    return data;
  }

  async function logout() {
    try {
      await apiLogout();
    } catch (e) {
      // ignorar falhas no logout remoto
    } finally {
      setUser(null);
      setEmpresa(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, empresa, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
