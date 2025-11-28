'use client';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  FileSearch,
  Bell,
  PlusCircle,
  Search,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';

interface MainAdminProps {
  children: ReactNode;
}

export default function MainAdmin({ children }: MainAdminProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [quickOpen, setQuickOpen] = useState<boolean>(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const quickRef = useRef<HTMLDivElement | null>(null);

  const [adminName, setAdminName] = useState<string>('Administrador');
  const [adminAvatar, setAdminAvatar] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    try {
      const name = localStorage.getItem('adminName') || localStorage.getItem('name') || '';
      const avatar = localStorage.getItem('adminAvatar') || localStorage.getItem('avatar') || '';
      if (name) setAdminName(name);
      if (avatar) setAdminAvatar(avatar);
    } catch {}
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
    }
    if (profileOpen || notifOpen || quickOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [profileOpen, notifOpen, quickOpen]);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', Icon: LayoutDashboard },
    { label: 'Empresas', path: '/admin/empresas', Icon: Building2 },
    { label: 'Usuários', path: '/admin/usuarios', Icon: Users },
    { label: 'Configurações', path: '/admin/configuracoes', Icon: Settings },
    { label: 'Auditoria', path: '/admin/auditoria', Icon: FileSearch },
  ];

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminAvatar');
    router.push('/');
  }

  const quickActions = [
    { label: 'Nova Empresa', onClick: () => router.push('/admin/empresas/novo'), Icon: PlusCircle },
    { label: 'Nova Fatura', onClick: () => router.push('/dashboard/faturas/novo'), Icon: PlusCircle },
    { label: 'Novo Usuário', onClick: () => router.push('/admin/usuarios/novo'), Icon: PlusCircle },
  ];

  const notifications = [
    { id: 1, text: 'Empresa X solicitou verificação', time: '1h' },
    { id: 2, text: 'Fatura 001 venceu hoje', time: '3h' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F2F2]">
      {/* SIDEBAR */}
      <aside
        className={`
          bg-white text-[#123859] shadow-md p-4 flex flex-col justify-between
          transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
              <div className={`${!sidebarOpen ? 'hidden' : 'text-[#123859] font-bold text-lg'}`}>
                Administrador
              </div>
            </div>

            <button
              aria-label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
              onClick={() => setSidebarOpen(s => !s)}
              className="p-1 rounded hover:bg-gray-100 transition-colors duration-150"
            >
              <Menu size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map(item => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
              const Icon = item.Icon;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`
                    flex items-center gap-3 p-2 rounded transition-all duration-200
                    ${isActive
                      ? 'bg-[#F9941F] text-white shadow-md scale-105'
                      : 'text-[#123859] hover:bg-[#F9941F] hover:text-white hover:scale-105'
                    }
                    ${!sidebarOpen ? 'justify-center' : ''}
                  `}
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#123859]'}`}
                  />
                  <span className={`${!sidebarOpen ? 'hidden' : ''} transition-colors duration-200`}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`${!sidebarOpen ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`w-full px-3 py-2 rounded text-white bg-red-500 hover:brightness-95 flex items-center justify-center gap-2 transition-all duration-200`}
          >
            <LogOut size={16} />
            <span className={`${!sidebarOpen ? 'hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* NAVBAR */}
        <header className="w-full bg-white shadow-md py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              aria-label="Alternar sidebar"
              onClick={() => setSidebarOpen(s => !s)}
              className="p-2 rounded hover:bg-gray-100 md:hidden transition-colors duration-150"
            >
              <Menu className="text-[#123859]" size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[#123859]">FacturaJá</span>
            </div>

            <div className="hidden md:flex items-center gap-2 ml-4 bg-[#F2F2F2] rounded px-2 py-1 transition-colors duration-150">
              <Search size={16} className="text-[#123859]" />
              <input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/admin/dashboard?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="bg-transparent outline-none text-sm text-[#123859]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* QUICK ACTIONS */}
            <div className="relative" ref={quickRef}>
              <button
                onClick={() => { setQuickOpen(q => !q); setNotifOpen(false); }}
                className="p-2 rounded hover:bg-gray-100 transition-colors duration-150"
              >
                <PlusCircle size={18} className="text-[#123859] transition-colors duration-200 hover:text-[#F9941F]" />
              </button>

              {quickOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded shadow-lg z-50">
                  <div className="p-2 border-b text-sm font-medium text-[#123859]">Ações rápidas</div>
                  <div className="p-2 flex flex-col gap-1">
                    {quickActions.map((q) => (
                      <button key={q.label} onClick={() => { q.onClick(); setQuickOpen(false); }} className="text-left px-3 py-2 rounded hover:bg-[#F2F2F2] flex items-center gap-2 transition-all duration-150 hover:scale-105">
                        <q.Icon size={16} className="transition-colors duration-150 hover:text-[#F9941F]" />
                        <span>{q.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICAÇÕES */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(n => !n); setQuickOpen(false); }}
                className="p-2 rounded hover:bg-gray-100 relative transition-colors duration-150"
              >
                <Bell size={18} className="text-[#123859] transition-colors duration-200 hover:text-[#F9941F]" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs text-white bg-red-500 rounded-full">2</span>
              </button>
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); setQuickOpen(false); }}
                className="flex items-center gap-3 rounded px-2 py-1 hover:bg-gray-100 transition-colors duration-150"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200">
                  {adminAvatar ? (
                    <img src={adminAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-[#123859] font-semibold">
                      {adminName.slice(0,1).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline text-[#123859] font-medium truncate max-w-[10rem] transition-colors duration-200">{adminName}</span>
                <ChevronDown size={16} className="text-[#123859] hidden sm:inline transition-colors duration-200" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50">
                  <div className="p-3 border-b">
                    <div className="font-medium text-[#123859]">{adminName}</div>
                    <div className="text-xs text-gray-500">Administrador</div>
                  </div>
                  <div className="flex flex-col p-1">
                    <button onClick={handleLogout} className="text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2 transition-all duration-150 hover:scale-105">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
