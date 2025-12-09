'use client';
import Link from 'next/link';
import React, { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  LogOut,
  Bell,
  Users,
  FileSearch,
  CreditCard,
  Box,
  BarChart,
  Settings,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { normalizeLogoUrl } from '../utils/normalizeLogo';

interface MainEmpresaProps {
  children: ReactNode;
}

export default function MainEmpresa({ children }: MainEmpresaProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, empresa, loading, logout } = useAuth();

  // valores finais (prioriza dados vindos do contexto)
  const empresaName = !loading ? empresa?.nome ?? 'Minha Empresa' : 'Carregando...';
  const empresaLogoRaw = empresa?.logo ?? null;
  const empresaLogo = empresaLogoRaw ? normalizeLogoUrl(empresaLogoRaw) : '/logo-placeholder.png';
  const finalUserName = user?.name ?? 'Usuário';
  const userPhoto = user?.photo ?? null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignorar, só garantir redirect
    } finally {
      router.push('/login');
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart size={16} />, exact: true },
    { label: 'Faturas', path: '/dashboard/Faturas', icon: <FileSearch size={16} /> },
    { label: 'Clientes', path: '/dashboard/Clientes', icon: <Users size={16} /> },
    { label: 'Produtos', path: '/dashboard/Produtos', icon: <Box size={16} /> },
    { label: 'Pagamentos', path: '/dashboard/Pagamentos', icon: <CreditCard size={16} /> },
    { label: 'Relatórios', path: '/dashboard/Relatorios', icon: <BarChart size={16} /> },
    { label: 'Configurações', path: '/dashboard/Configuracoes', icon: <Settings size={16} /> },
    { label: 'Perfil', path: '/dashboard/Perfil', icon: <User size={16} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white text-[#123859] shadow-md p-4 flex flex-col justify-between
          transition-all duration-300 z-50
          ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
          md:relative md:w-64 md:h-auto
        `}
        aria-hidden={!sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768}
      >
        <div>
          {/* Logo + Nome */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
              {empresaLogo && (
                <img
                  src={empresaLogo}
                  alt={empresa?.nome ? `${empresa.nome} logo` : 'Logo'}
                  className={`h-8 w-8 rounded-full object-cover ${!sidebarOpen ? 'mx-auto' : ''}`}
                />
              )}
              <span className={`${!sidebarOpen ? 'hidden' : 'font-bold text-lg'}`}>
                {empresaName}
              </span>
            </div>
          </div>

          {/* Informações rápidas da empresa */}
          {sidebarOpen && empresa && !loading && (
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              {empresa.nif && <p><strong>NIF:</strong> {empresa.nif}</p>}
              {empresa.email && <p><strong>Email:</strong> {empresa.email}</p>}
              {empresa.telefone && <p><strong>Telefone:</strong> {empresa.telefone}</p>}
              {empresa.endereco && <p><strong>Endereço:</strong> {empresa.endereco}</p>}
            </div>
          )}

          {/* Menu */}
          <nav className="flex flex-col gap-2 relative" aria-label="Main navigation">
            {menuItems.map((item) => {
              const isActive = item.exact ? pathname === item.path : !!pathname?.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group flex items-center gap-3 p-2 rounded relative transition-all duration-300 ${
                    isActive ? 'text-white font-semibold bg-[#F9941F]' : 'text-[#123859] hover:text-[#F9941F]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-[#F9941F] rounded-tr-lg rounded-br-lg" />
                  )}
                  <span className="relative flex items-center gap-3 w-full">
                    <span className={`transition-colors duration-200 ${isActive ? 'text-white' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`${!sidebarOpen ? 'hidden md:inline' : 'transition-colors duration-200'}`}>
                      {item.label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className={`${!sidebarOpen ? 'flex justify-center' : ''} mt-6`}>
          <button
            onClick={handleLogout}
            className="sm:w-full md:w-auto px-3 py-2 rounded text-white bg-[#F9941F] hover:brightness-95 flex items-center justify-center gap-2 transition-all duration-150"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className={`${!sidebarOpen ? 'hidden md:inline' : ''}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {/* NAVBAR */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((s) => !s)}
              className="p-2 rounded hover:bg-[#E5E5E5] transition-colors duration-150 md:hidden"
            >
              <Menu size={20} />
            </button>

            {empresaLogo && (
              <img src={empresaLogo} alt={empresa?.nome ? `${empresa.nome} logo` : 'Logo'} className="h-8 w-8 rounded-full object-cover" />
            )}

            <span className="font-bold text-[#123859]">{empresaName}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded hover:bg-[#E5E5E5] transition-colors duration-150" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {userPhoto ? (
              <img src={userPhoto} alt={finalUserName ?? 'User'} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                {(finalUserName && finalUserName[0]) ?? 'U'}
              </div>
            )}

            <span className="font-medium text-[#123859] hidden sm:inline">{!loading ? finalUserName : ''}</span>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
