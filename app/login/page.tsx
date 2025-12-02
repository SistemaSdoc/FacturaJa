'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const COLOR_PRIMARY = "#123859";
const COLOR_ACCENT = "#F9941F";

// Ícone da plataforma
const InvoiceIcon = ({ sizeClass = "w-10 h-10", color = COLOR_PRIMARY }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={sizeClass}
    style={{ color }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

export default function LoginPage() {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      // Salva token/role no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // Redireciona conforme role
      if (data.role === "admin") router.push("/admin/dashboard");
      else router.push("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-inter bg-animated-gradient">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* Lado esquerdo */}
        <div
          className="hidden lg:flex flex-col items-center justify-center p-10 xl:p-16 text-white w-1/2"
          style={{ backgroundColor: COLOR_PRIMARY }}
        >
          <InvoiceIcon sizeClass="w-24 h-24 mb-4" color={COLOR_ACCENT} />
          <h2 className="text-5xl font-extrabold text-center mb-4 text-white">
            Fatura<span style={{ color: COLOR_ACCENT }}>Já</span>
          </h2>
          <p className="text-xl text-center leading-relaxed text-gray-200">
            Plataforma inteligente para faturação rápida e compatível.
          </p>
        </div>

        {/* Lado direito */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <InvoiceIcon sizeClass="w-12 h-12" color={COLOR_PRIMARY} />
            <h2 className="text-3xl font-extrabold mt-3 text-[#123859]">
              Entrar no Fatura<span style={{ color: COLOR_ACCENT }}>Já</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Aceda à sua conta e comece a faturar.
            </p>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* DOMÍNIO */}
            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium mb-2 text-[#123859]"
              >
                Domínio da Empresa
              </label>
              <input
                id="domain"
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full border rounded-xl p-3 outline-none transition duration-150 text-gray-800 focus:ring-2 focus:ring-[#F9941F] focus:border-[#F9941F]"
                placeholder="exemplo.com"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-[#123859]"
              >
                Endereço de Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl p-3 outline-none transition duration-150 text-gray-800 focus:ring-2 focus:ring-[#F9941F] focus:border-[#F9941F]"
                placeholder="exemplo@empresa.pt"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition flex justify-center items-center ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#123859] hover:bg-[#F9941F] text-white"
              }`}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                "Iniciar Sessão"
              )}
            </button>
          </form>

          {/* LOGIN SOCIAL */}
          <div className="mt-8">
            <div className="flex items-center gap-3 my-4">
              <span className="w-full h-px bg-gray-300"></span>
              <span className="text-gray-500 text-sm">ou</span>
              <span className="w-full h-px bg-gray-300"></span>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 mb-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
            >
              {/* SVG Google */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-5 h-5">
                <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.3h147.3c-6.4 34-26 62.9-55.4 82V485h89.4c52.3-48.1 80.1-118.4 80.1-206.6z"/>
                <path fill="#34a853" d="M272.1 544.3c74.8 0 137.6-24.7 183.5-66.9l-89.4-79.8c-24.8 16.9-56.3 26.7-94.1 26.7-72.2 0-133.2-48.6-155-113.9H25.6v85.7c45.3 89.2 138 148.2 246.5 148.2z"/>
                <path fill="#fbbc04" d="M117.1 310.4C110.3 293.5 106 275 106 256s4.3-37.5 11.1-54.4V116H25.6C9.1 151.3 0 192.3 0 236.5c0 44.2 9.1 85.2 25.6 120.5l91.5-46.6z"/>
                <path fill="#ea4335" d="M272.1 102.3c40.7 0 77.2 14 106.2 41.3l79.4-79.4C409.7 24.6 346.9 0 272.1 0 163.6 0 70.9 58.9 25.6 148.1l91.5 85.7c21.8-65.3 82.8-113.9 155-113.9z"/>
              </svg>
              <span className="text-gray-700 font-medium">Entrar com Google</span>
            </button>

            {/* GITHUB BUTTON */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
            >
              {/* SVG GitHub */}
              <svg
                className="w-6 h-6 text-gray-800"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 0C5.37 0 0 5.48 0 12.25c0 5.41 3.44 9.98 8.21 11.6.6.12.82-.27.82-.6v-2.1c-3.34.75-4.04-1.64-4.04-1.64-.55-1.43-1.34-1.8-1.34-1.8-1.09-.77.08-.75.08-.75 1.2.09 1.83 1.26 1.83 1.26 1.07 1.88 2.8 1.34 3.49 1.02.11-.8.42-1.34.76-1.65-2.67-.31-5.47-1.38-5.47-6.16 0-1.36.46-2.47 1.23-3.34-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.28a11 11 0 0 1 3-.42c1.02 0 2.05.14 3 .42 2.29-1.61 3.29-1.28 3.29-1.28.67 1.69.25 2.94.13 3.25.77.87 1.23 1.98 1.23 3.34 0 4.8-2.8 5.85-5.48 6.16.43.38.82 1.14.82 2.3v3.41c0 .33.22.72.82.6 4.78-1.62 8.21-6.19 8.21-11.6C24 5.48 18.63 0 12 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700 font-medium">Entrar com GitHub</span>
            </button>
          </div>

          {/* Esqueci senha */}
          <div className="mt-6 text-center text-sm">
            <a
              href="/esqueci"
              className="font-medium text-[#F9941F] hover:underline"
            >
              Esqueceu a Palavra-passe?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
