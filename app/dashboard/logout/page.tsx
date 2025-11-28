'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpar token e outras info do usuário
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // se houver
    }

    // Redirecionar para login
    router.push('/login');
  }, [router]);

  return (
    <MainLayout>
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-[#123859] text-lg">Saindo da sua conta...</p>
      </div>
    </MainLayout>
  );
}
