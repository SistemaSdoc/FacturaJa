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

  auth0Client = await createAuth0Client({
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
    client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
    redirect_uri: window.location.origin,
  });

  return auth0Client;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const client = await getAuth0Client();

      // Trata redirecionamento do Auth0
      if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
        await client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
      }

      const userData = await client.getUser();
      setUser(userData);
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async () => {
    const client = await getAuth0Client();
    await client.loginWithRedirect();
  };

  const logout = async () => {
    const client = await getAuth0Client();
    client.logout({ returnTo: window.location.origin });
    setUser(null);
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
