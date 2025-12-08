'use client';
import React, { useState } from "react";
import MainCliente from "../../components/MainCliente"; // ajuste o caminho conforme sua pasta
import { FaUser, FaKey, FaGlobe } from "react-icons/fa";

export default function ClientConfig() {
  const [name, setName] = useState("João Cliente");
  const [email, setEmail] = useState("joao@email.com");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("pt");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Configurações salvas com sucesso!");
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // estilos reutilizáveis (sem dependência de tema)
  const cardBg = 'var(--surface)'; // cards usam --surface
  const cardBorder = '2px solid rgba(0,0,0,0.04)'; // fallback — visual leve
  const textColor = 'var(--primary)';

  return (
    <MainCliente>
      <div
        className="min-h-screen p-4 lg:p-6 transition-colors duration-300"
        style={{
          background: 'var(--bg)', // usa variáveis definidas globalmente
          color: textColor,
        }}
      >
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--accent)' }}>
          Configurações da Conta
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil */}
          <div
            className="p-6 rounded-2xl shadow"
            style={{
              background: cardBg,
              border: cardBorder,
              color: 'var(--primary)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent)' }}>
              Perfil
            </h2>

            {/* Foto de Perfil */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2" style={{ borderColor: 'var(--primary)' }}>
                {profileImage ? (
                  <img src={profileImage} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface)', color: 'var(--primary)', fontWeight: 700 }}>
                    JD
                  </div>
                )}
              </div>
              <label className="px-3 py-1 rounded-lg cursor-pointer" style={{ background: 'var(--surface)', color: 'var(--primary)' }}>
                Alterar Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
              </label>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Nome</label>
                <div className="flex items-center gap-2 border rounded-lg p-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <FaUser className="text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 outline-none bg-transparent"
                    style={{ color: 'var(--primary)' }}
                    placeholder="Digite seu nome"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded-lg p-2 outline-none bg-transparent"
                  style={{ borderColor: 'rgba(0,0,0,0.06)', color: 'var(--primary)' }}
                  placeholder="Digite seu email"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Senha</label>
                <div className="flex items-center gap-2 border rounded-lg p-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <FaKey className="text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 outline-none bg-transparent"
                    style={{ color: 'var(--primary)' }}
                    placeholder="Nova senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg hover:opacity-95"
                style={{ background: 'var(--accent)', color: 'var(--text-on-dark)' }}
              >
                Salvar Alterações
              </button>
            </form>
          </div>

          {/* Preferências */}
          <div
            className="p-6 rounded-2xl shadow flex flex-col gap-4"
            style={{
              background: cardBg,
              border: cardBorder,
              color: 'var(--primary)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent)' }}>
              Preferências
            </h2>

            {/* Notificações Toggle */}
            <div className="flex justify-between items-center border rounded-lg p-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span>Receber Notificações</span>
              <div
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer`}
                onClick={() => setNotifications(!notifications)}
                style={{ background: notifications ? 'var(--accent)' : 'rgba(0,0,0,0.18)' }}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300`}
                  style={{ transform: notifications ? 'translateX(1.2rem)' : 'translateX(0)' }}
                ></div>
              </div>
            </div>

            {/* Idioma */}
            <div className="flex justify-between items-center border rounded-lg p-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span className="flex items-center gap-2"><FaGlobe /> Idioma</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border rounded-lg p-1 outline-none bg-transparent"
                style={{ color: 'var(--primary)', borderColor: 'rgba(0,0,0,0.06)' }}
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* Resetar Conta */}
            <button className="mt-4 px-4 py-2 rounded-lg hover:opacity-95" style={{ background: 'var(--accent)', color: 'var(--text-on-dark)' }}>
              Resetar Conta
            </button>
          </div>
        </div>
      </div>
    </MainCliente>
  );
}
