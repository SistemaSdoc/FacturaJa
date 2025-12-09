'use client';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/'); // envia ao login
  }, [user, loading]);

  if (loading) return <div className="p-8">Carregando...</div>;
  return <>{children}</>;
}
