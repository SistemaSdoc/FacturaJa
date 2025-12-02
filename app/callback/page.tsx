// src/app/callback/page.tsx
'use client';
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const { handleRedirect, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const processAuth = async () => {
      await handleRedirect();
      router.replace("/dashboard"); // redireciona para o dashboard
    };
    processAuth();
  }, [handleRedirect, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">A processar login...</h1>
        <p className="text-gray-600 mt-2">{loading ? "Carregando..." : ""}</p>
      </div>
    </div>
  );
}
