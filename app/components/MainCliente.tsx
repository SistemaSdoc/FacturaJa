'use client';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  FileSearch,
  Bell,
  LogOut,
  Menu,
  Search,
  Settings
} from 'lucide-react';

interface MainClienteProps {
  children: ReactNode;
}

export default function MainCliente({ children }: MainClienteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const [clientName, setClientName] = useState('Cliente');
  const [clientAvatar, setClientAvatar] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Empresa X');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const name = localStorage.getItem('clientName') || '';
      const avatar = localStorage.getItem('clientAvatar') || '';
      const company = localStorage.getItem('companyName') || '';
      if (name) setClientName(name);
      if (avatar) setClientAvatar(avatar);
      if (company) setCompanyName(company);
    } catch { }
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    if (profileOpen || notifOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [profileOpen, notifOpen]);

  const menuItems = [
    { label: 'Minha Conta', path: '/cliente/conta', Icon: Users },
    { label: 'Faturas', path: '/cliente/invoices/view/[public_id]', Icon: FileSearch },
    { label: 'Pagamentos', path: '/cliente/invoices/pay/[public_id]', Icon: FileSearch },
    { label: 'Configurações', path: '/cliente/configuracoes', Icon: Settings },
  ];

  const notifications = [
    { id: 1, text: 'Nova fatura disponível', time: '2h' },
    { id: 2, text: 'Pagamento pendente', time: '4h' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-[#F2F2F2]">
      {/* SIDEBAR */}
      <aside className={`bg-white shadow-md p-4 flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
              <div className={`${!sidebarOpen ? 'hidden' : 'text-[#123859] font-bold text-lg'}`}>Cliente</div>
            </div>

            <button
              aria-label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
              onClick={() => setSidebarOpen(s => !s)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Menu size={18} className="text-[#123859]" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 relative">
            {menuItems.map(item => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
              const Icon = item.Icon;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`
                    relative flex items-center gap-3 p-2 rounded transition-colors duration-150 group
                    ${!sidebarOpen ? 'justify-center' : ''}
                  `}
                >
                  {/* Barra lateral colorida para item ativo */}
                  {isActive && <span className="absolute left-0 top-0 h-full w-1 bg-[#F9941F] rounded-tr-lg rounded-br-lg"></span>}

                  <Icon
                    className={`transition-colors duration-150 ${isActive ? 'text-[#123859]' : 'text-[#123859] group-hover:text-[#F9941F]'}`}
                    size={18}
                  />
                  <span className={`${!sidebarOpen ? 'hidden' : 'transition-colors duration-150'} ${isActive ? 'text-[#F9941F] font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`${!sidebarOpen ? 'flex justify-center' : ''}`}>
          <button onClick={handleLogout} className="w-full px-3 py-2 rounded text-white bg-[#F9941F] hover:brightness-95 flex items-center justify-center gap-2">
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
            <button aria-label="Alternar sidebar" onClick={() => setSidebarOpen(s => !s)} className="p-2 rounded hover:bg-gray-100 md:hidden">
              <Menu className="text-[#123859]" size={18} />
            </button>

            <div className="flex items-center gap-2">
              <img src={clientAvatar || '/images/default-avatar.png'} alt="Avatar do cliente" className="w-9 h-9 rounded-full" />
              <span className="font-bold text-[#123859]">{companyName}</span>
            </div>

            <div className="hidden md:flex items-center gap-2 ml-4 bg-[#F2F2F2] rounded px-2 py-1">
              <Search size={16} className="text-[#123859]" />
              <input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(`/cliente/conta?search=${encodeURIComponent(searchQuery)}`);
                }}
                className="bg-transparent outline-none text-sm text-[#123859]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* NOTIFICAÇÕES */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(n => !n)} className="p-2 rounded hover:bg-gray-100 relative">
                <Bell size={18} className="text-[#123859]" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs text-white bg-[#F9941F] rounded-full">{notifications.length}</span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-50">
                  <div className="p-2 border-b text-sm font-medium text-[#F9941F]">Notificações</div>
                  <div className="p-2 flex flex-col gap-2 max-h-64 overflow-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="px-3 py-2 rounded hover:bg-gray-50">
                        <div className="text-sm text-[#123859]">{n.text}</div>
                        <div className="text-xs text-gray-500">{n.time}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t text-center">
                    <button onClick={() => router.push('/cliente/notifications')} className="text-sm text-[#F9941F] hover:underline">Ver tudo</button>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(p => !p)} className="flex items-center gap-3 rounded px-2 py-1 hover:bg-gray-100">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200">
                  <img src={clientAvatar || '/images/default-avatar.png'} alt="Avatar do cliente" className="rounded-full w-16 h-16" />
                </div>
                <span className="hidden sm:inline text-[#123859] font-medium truncate max-w-[10rem]">{clientName}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50">
                  <div className="p-3 border-b">
                    <div className="font-medium text-[#123859]">{clientName}</div>
                    <div className="text-xs text-gray-500">{companyName}</div>
                  </div>
                  <div className="flex flex-col p-1">
                    <button onClick={handleLogout} className="text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2">
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
