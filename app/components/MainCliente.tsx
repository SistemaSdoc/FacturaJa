"use client";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Users, FileSearch, Bell, LogOut, Menu, Search, Settings } from "lucide-react";

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

  const [clientName, setClientName] = useState("Cliente");
  const [clientAvatar, setClientAvatar] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Empresa X");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const name = localStorage.getItem("clientName") || "";
      const avatar = localStorage.getItem("clientAvatar") || "";
      const company = localStorage.getItem("companyName") || "";
      if (name) setClientName(name);
      if (avatar) setClientAvatar(avatar);
      if (company) setCompanyName(company);
    } catch {}
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    }
    if (profileOpen || notifOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [profileOpen, notifOpen]);

  const menuItems = [
    { label: "Minha Conta", path: "/cliente/conta", Icon: Users },
    { label: "Faturas", path: "/cliente/invoices/view/[public_id]", Icon: FileSearch },
    { label: "Pagamentos", path: "/cliente/invoices/pay/[public_id]", Icon: FileSearch },
    { label: "Configurações", path: "/cliente/configuracoes", Icon: Settings },
  ];

  const notifications = [
    { id: 1, text: "Nova fatura disponível", time: "2h" },
    { id: 2, text: "Pagamento pendente", time: "4h" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const accent = "var(--accent)";

  return (
    <div className="flex min-h-screen bg-var(--bg) text-var(--primary)">
      {/* SIDEBAR */}
      <aside
        className={`shadow-md p-4 flex flex-col justify-between transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
        style={{ background: "var(--surface)" }}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${!sidebarOpen ? "justify-center w-full" : ""}`}>
              <div className={`${!sidebarOpen ? "hidden" : "font-bold text-lg"}`} style={{ color: "var(--primary)" }}>
                Cliente
              </div>
            </div>

            <button
              aria-label={sidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
              onClick={() => setSidebarOpen((s) => !s)}
              className="p-1 rounded hover:opacity-90"
            >
              <Menu size={18} style={{ color: "var(--primary)" }} />
            </button>
          </div>

          <nav className="flex flex-col gap-2 relative">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
              const Icon = item.Icon;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`relative flex items-center gap-3 p-2 rounded transition-colors duration-150 group ${
                    !sidebarOpen ? "justify-center" : ""
                  }`}
                  style={{ color: isActive ? "var(--accent)" : "var(--primary)" }}
                >
                  {isActive && (
                    <span
                      style={{ backgroundColor: accent }}
                      className="absolute left-0 top-0 h-full w-1 rounded-tr-lg rounded-br-lg"
                    ></span>
                  )}
                  <Icon size={18} style={{ color: isActive ? "var(--accent)" : "var(--primary)" }} />
                  <span
                    className={`${!sidebarOpen ? "hidden" : "transition-colors duration-150"}`}
                    style={{ color: isActive ? "var(--accent)" : "var(--primary)", fontWeight: isActive ? 600 : 500 }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`${!sidebarOpen ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded text-white hover:brightness-95 flex items-center justify-center gap-2"
            style={{ background: "var(--accent)" }}
          >
            <LogOut size={16} color="white" />
            <span className={`${!sidebarOpen ? "hidden" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* NAVBAR */}
        <header className="w-full shadow-md py-3 px-4 flex items-center justify-between" style={{ background: "var(--surface)" }}>
          <div className="flex items-center gap-4">
            <button
              aria-label="Alternar sidebar"
              onClick={() => setSidebarOpen((s) => !s)}
              className="p-2 rounded hover:opacity-90 md:hidden"
            >
              <Menu size={18} style={{ color: "var(--primary)" }} />
            </button>

            <div className="flex items-center gap-2">
              <img src={clientAvatar || "/images/default-avatar.png"} alt="Avatar do cliente" className="w-9 h-9 rounded-full" />
              <span className="font-bold" style={{ color: "var(--primary)" }}>
                {companyName}
              </span>
            </div>

            <div
              className="hidden md:flex items-center gap-2 ml-4 rounded px-2 py-1"
              style={{ background: "color-mix(in srgb, var(--surface) 85%, transparent)", borderRadius: 8 }}
            >
              <Search size={16} style={{ color: "var(--primary)" }} />
              <input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/cliente/conta?search=${encodeURIComponent(searchQuery)}`);
                }}
                className="bg-transparent outline-none text-sm"
                style={{ color: "var(--primary)" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* NOTIFICAÇÕES */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen((n) => !n)} className="p-2 rounded hover:opacity-90 relative">
                <Bell size={18} style={{ color: "var(--primary)" }} />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs text-white rounded-full" style={{ background: "var(--accent)" }}>
                  {notifications.length}
                </span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded shadow-lg z-50" style={{ background: "var(--surface)" }}>
                  <div className="p-2 border-b text-sm font-medium" style={{ color: "var(--accent)", borderBottomColor: "rgba(0,0,0,0.06)" }}>
                    Notificações
                  </div>
                  <div className="p-2 flex flex-col gap-2 max-h-64 overflow-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-3 py-2 rounded" style={{ cursor: "default" }}>
                        <div className="text-sm" style={{ color: "var(--primary)" }}>
                          {n.text}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
                          {n.time}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
                    <button onClick={() => router.push("/cliente/notificacoes")} className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
                      Ver tudo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen((p) => !p)} className="flex items-center gap-3 rounded px-2 py-1 hover:opacity-90">
                <div className="w-9 h-9 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.04)" }}>
                  <img src={clientAvatar || "/images/default-avatar.png"} alt="Avatar do cliente" className="rounded-full w-16 h-16" />
                </div>
                <span className="hidden sm:inline font-medium truncate max-w-[10rem]" style={{ color: "var(--primary)" }}>
                  {clientName}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded shadow-lg z-50" style={{ background: "var(--surface)" }}>
                  <div className="p-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div className="font-medium" style={{ color: "var(--primary)" }}>
                      {clientName}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
                      {companyName}
                    </div>
                  </div>
                  <div className="flex flex-col p-1">
                    <button onClick={handleLogout} className="text-left px-4 py-2 hover:bg-transparent flex items-center gap-2" style={{ color: "#ef4444" }}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4" style={{ background: "transparent" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
