"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaUser, FaKey, FaArrowLeft, FaGlobe } from "react-icons/fa";

export default function ClientConfig() {
  const [name, setName] = useState("João Cliente");
  const [email, setEmail] = useState("joao@email.com");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("pt");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#123859] p-4 lg:p-6 transition-colors duration-300">
      <Link href="/cliente/conta" className="flex items-center gap-2 mb-4 hover:underline">
        <FaArrowLeft /> Voltar
      </Link>


      <h1 className="text-2xl font-bold mb-6">Configurações da Conta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Perfil */}
        <div className="bg-white p-6 rounded-2xl shadow border border-[#E5E5E5]">
          <h2 className="text-xl font-semibold mb-4">Perfil</h2>

          {/* Foto de Perfil */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-[#123859]">
              {profileImage ? (
                <img src={profileImage} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#E5E5E5] text-[#123859] font-bold">
                  JD
                </div>
              )}
            </div>
            <label className="bg-[#E5E5E5] text-[#123859] px-3 py-1 rounded-lg cursor-pointer hover:bg-[#d1d5db]">
              Alterar Foto
              <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
            </label>

          </div>

          {/* Formulário */}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Nome</label>
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <FaUser className="text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-[#123859]"
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
                className="border rounded-lg p-2 outline-none bg-transparent text-[#123859]"
                placeholder="Digite seu email"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Senha</label>
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <FaKey className="text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-[#123859]"
                  placeholder="Nova senha"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#F9941F] text-white px-4 py-2 rounded-lg hover:bg-[#e68a00]"
            >
              Salvar Alterações
            </button>

          </form>
        </div>

        {/* Preferências */}
        <div className="bg-white p-6 rounded-2xl shadow border border-[#E5E5E5] flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-4">Preferências</h2>

          {/* Modo Escuro Toggle */}
          <div className="flex justify-between items-center border rounded-lg p-3">
            <span>Modo Escuro</span>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${darkMode ? "bg-green-500" : "bg-gray-300"
                }`}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${darkMode ? "translate-x-6" : ""
                  }`}
              ></div>
            </div>
          </div>

          {/* Notificações Toggle */}
          <div className="flex justify-between items-center border rounded-lg p-3">
            <span>Receber Notificações</span>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${notifications ? "bg-green-500" : "bg-gray-300"
                }`}
              onClick={() => setNotifications(!notifications)}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${notifications ? "translate-x-6" : ""
                  }`}
              ></div>
            </div>
          </div>

          {/* Idioma */}
          <div className="flex justify-between items-center border rounded-lg p-3">
            <span className="flex items-center gap-2"><FaGlobe /> Idioma</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded-lg p-1 outline-none text-[#123859] bg-transparent"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Resetar Conta */}
          <button className="mt-4 bg-[#F9941F] text-white px-4 py-2 rounded-lg hover:bg-[#e68a00]">
            Resetar Conta
          </button>

        </div>
      </div>
    </div>
  );
}
