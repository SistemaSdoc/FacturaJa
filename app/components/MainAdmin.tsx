'use client';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Bell,
  PlusCircle,
  Search,
  LogOut,
  ChevronDown,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

interface MainAdminProps {
  children: ReactNode;
}

export default function MainAdmin({ children }: MainAdminProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [quickOpen, setQuickOpen] = useState<boolean>(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const quickRef = useRef<HTMLDivElement | null>(null);

  const [adminName, setAdminName] = useState<string>('Administrador');
  const [adminAvatar, setAdminAvatar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
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
    { label: 'Dashboard', path: '/admin', Icon: LayoutDashboard },
    { label: 'Empresas', path: '/admin/empresas', Icon: Building2 },
    { label: 'Usuários', path: '/admin/usuarios', Icon: Users },
    { label: 'Configurações', path: '/admin/configuracoes', Icon: Settings },
  ];

  const quickActions = [
    { label: 'Nova Empresa', onClick: () => router.push('/admin/empresas/novo'), Icon: PlusCircle },
    { label: 'Nova Fatura', onClick: () => router.push('/dashboard/faturas/novo'), Icon: PlusCircle },
    { label: 'Novo Usuário', onClick: () => router.push('/admin/usuarios/novo'), Icon: PlusCircle },
  ];

  const notifications = [
    { id: 1, text: 'Empresa X solicitou verificação', time: '1h' },
    { id: 2, text: 'Fatura 001 venceu hoje', time: '3h' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminAvatar');
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--primary)] dark:bg-[var(--background)] dark:text-[var(--accent)] transition-colors duration-300">
      {/* SIDEBAR */}
      <aside
        className={`bg-[var(--sidebar)] text-[var(--sidebar-foreground)] shadow-md p-4 flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div>
          {/* Botão de colapsar sidebar */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
              <div className={`${!sidebarOpen ? 'hidden' : 'font-bold text-lg'}`}>Administrador</div>
            </div>
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="p-1 rounded hover:bg-[var(--accent)]/20 transition-colors duration-150"
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
                  className={`flex items-center gap-3 p-2 rounded transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-md scale-105'
                      : 'hover:bg-[var(--accent)] hover:text-white hover:scale-105'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                >
                  <Icon size={18} />
                  <span className={`${!sidebarOpen ? 'hidden' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`${!sidebarOpen ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded text-white bg-[var(--accent)] hover:brightness-95 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <LogOut size={16} />
            <span className={`${!sidebarOpen ? 'hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* NAVBAR */}
        <header className="w-full bg-[var(--surface)] text-[var(--primary)] dark:bg-[var(--background)] dark:text-[var(--accent)] shadow-md py-3 px-4 flex items-center justify-between flex-wrap transition-colors duration-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold">FacturaJá</span>

            <div className="flex items-center gap-2 bg-[var(--background)] rounded px-2 py-1 flex-1 min-w-[200px]">
              <Search size={16} />
              <input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    router.push(`/admin/dashboard?search=${encodeURIComponent(searchQuery)}`);
                }}
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* QUICK ACTIONS */}
            <div className="relative" ref={quickRef}>
              <button
                onClick={() => {
                  setQuickOpen(q => !q);
                  setNotifOpen(false);
                }}
                className="p-2 rounded hover:bg-[var(--accent)]/20 transition-colors duration-150"
              >
                <PlusCircle size={18} />
              </button>
              {quickOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[var(--surface)] rounded shadow-lg z-50">
                  <div className="p-2 border-b text-sm font-medium">Ações rápidas</div>
                  <div className="p-2 flex flex-col gap-1">
                    {quickActions.map(q => (
                      <button
                        key={q.label}
                        onClick={() => {
                          q.onClick();
                          setQuickOpen(false);
                        }}
                        className="text-left px-3 py-2 rounded hover:bg-[var(--accent)]/20 flex items-center gap-2 transition-all duration-150"
                      >
                        <q.Icon size={16} />
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
                onClick={() => {
                  setNotifOpen(n => !n);
                  setQuickOpen(false);
                }}
                className="p-2 rounded hover:bg-[var(--accent)]/20 relative transition-colors duration-150"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs text-white bg-[var(--accent)] rounded-full">
                  {notifications.length}
                </span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] rounded shadow-lg z-50">
                  <div className="p-3 border-b text-sm font-medium">Notificações</div>
                  <div className="max-h-64 overflow-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="px-3 py-2 flex items-center justify-between hover:bg-[var(--accent)]/10 transition-colors duration-150">
                        <span className="text-sm">{n.text}</span>
                        <span className="text-xs opacity-70">{n.time}</span>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="px-3 py-6 text-sm opacity-70">Sem notificações</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TOGGLE THEME */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-[var(--accent)]/20 transition-colors duration-150"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(p => !p);
                  setNotifOpen(false);
                  setQuickOpen(false);
                }}
                className="flex items-center gap-3 rounded px-2 py-1 hover:bg-[var(--accent)]/20 transition-colors duration-150"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--background)]">
                  {adminAvatar ? (
                    <img src={adminAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold">
                      {adminName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="font-medium truncate max-w-[10rem]">{adminName}</span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] rounded shadow-lg z-50">
                  <div className="p-3 border-b">
                    <div className="font-medium">{adminName}</div>
                    <div className="text-xs opacity-70">Administrador</div>
                  </div>
                  <div className="flex flex-col p-1">
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2 text-red-600 hover:bg-[var(--accent)]/10 flex items-center gap-2 transition-all duration-150"
                    >
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
