'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createAuth0Client, Auth0Client } from "@auth0/auth0-spa-js";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let auth0Client: Auth0Client | null = null;

const getAuth0Client = async () => {
  if (auth0Client) return auth0Client;

  console.log("Tentando criar Auth0Client...");
  console.log("Domain:", process.env.NEXT_PUBLIC_AUTH0_DOMAIN);
  console.log("Client ID:", process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID);
  console.log("Redirect URI:", process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI);

  if (!process.env.NEXT_PUBLIC_AUTH0_DOMAIN || !process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID) {
    throw new Error("Auth0 Domain ou Client ID não definidos. Verifique seu .env.local");
  }

  auth0Client = await createAuth0Client({
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
    authorizationParams: {
      redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI!,
    },
    cacheLocation: "localstorage",
    useRefreshTokens: true,
  });

  console.log("Auth0Client criado com sucesso!");
  return auth0Client;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await getAuth0Client();

        // Trata o redirecionamento do Auth0
        if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
          console.log("Processando callback do Auth0...");
          await client.handleRedirectCallback();
          window.history.replaceState({}, document.title, "/dashboard");
        }

        const userData = await client.getUser();
        console.log("Usuário autenticado:", userData);
        setUser(userData);
      } catch (err) {
        console.error("Erro na inicialização do Auth0:", err);
        alert("Erro na autenticação. Verifique o console.");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    try {
      const client = await getAuth0Client();
      await client.loginWithRedirect();
    } catch (err) {
      console.error("Erro ao iniciar login:", err);
      alert("Erro ao tentar iniciar sessão. Verifique o console.");
    }
  };

  const logout = async () => {
    try {
      const client = await getAuth0Client();
      client.logout({ returnTo: window.location.origin });
      setUser(null);
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
