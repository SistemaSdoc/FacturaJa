'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getUser,
  getTenant,
  normalizeLogoUrl
} from '../services/axios'; // ajuste o path se necessário
import { useRouter } from 'next/navigation';

// ----------------- TIPAGENS -----------------
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cliente';
  [k: string]: any;
};

export type Empresa = {
  id?: string;
  name?: string;
  logo?: string | null;
  email?: string;
  telefone?: string;
  endereco?: string;
  [k: string]: any;
};

export type Tenant = {
  id: string;
  name: string;
  subdomain: string;
  database_name: string;
  empresa?: Empresa;
  [k: string]: any;
};

type AuthContextValue = {
  user: User | null;
  empresa: Empresa | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string, tenantSubdomain?: string) => Promise<any>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ----------------- AUTH PROVIDER -----------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // ----------------- CARREGAR DADOS AO MONTAR -----------------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (token) {
          const u = await getUser();
          const t = await getTenant();

          if (!mounted) return;

          setUser(u ?? null);
          setTenant(t ?? null);
          setEmpresa(t?.empresa ?? null);

          if (t?.subdomain) localStorage.setItem("tenant", t.subdomain);
        }
      } catch (err) {
        if (!mounted) return;
        localStorage.removeItem("token");
        localStorage.removeItem("tenant");
        setUser(null);
        setTenant(null);
        setEmpresa(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------- LOGIN -----------------
  async function login(email: string, password: string, tenantSubdomain?: string) {
    setLoading(true);
    try {
      const data = await apiLogin(email, password, tenantSubdomain);

      if (data?.token) localStorage.setItem("token", data.token);

      // tenant pode vir como string ou objeto
      const tenantData: Tenant | null =
        typeof data?.tenant === "string"
          ? { id: "", name: data.tenant, subdomain: data.tenant, database_name: "" }
          : (data?.tenant as Tenant) ?? null;

      if (tenantData?.subdomain) localStorage.setItem("tenant", tenantData.subdomain);

      setUser(data?.user ?? null);
      setTenant(tenantData);
      setEmpresa(tenantData?.empresa ?? null);

      router.push(data?.redirect || "/dashboard");
      return data;
    } catch (err: any) {
      console.error("Erro no login:", err);
      throw err?.message || "Erro desconhecido ao logar";
    } finally {
      setLoading(false);
    }
  }

  // ----------------- LOGOUT -----------------
  async function logout() {
    setLoading(true);
    try {
      await apiLogout();
    } catch (e) {
      console.error("Erro no logout:", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("tenant");
      setUser(null);
      setTenant(null);
      setEmpresa(null);
      setLoading(false);
      router.push("/login");
    }
  }

  // ----------------- REFRESH -----------------
  async function refresh() {
    setLoading(true);
    try {
      const u = await getUser();
      const t = await getTenant();

      setUser(u ?? null);
      setTenant(t ?? null);
      setEmpresa(t?.empresa ?? null);

      if (t?.subdomain) localStorage.setItem("tenant", t.subdomain);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
      await logout();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, empresa, tenant, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// ----------------- HOOK PARA USAR CONTEXTO -----------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used dentro de <AuthProvider>');
  return ctx;
}

// ----------------- LOGO NORMALIZADA -----------------
export function useEmpresaLogo() {
  const { empresa } = useAuth();
  if (!empresa) return null;
  return normalizeLogoUrl(empresa.logo);
}
