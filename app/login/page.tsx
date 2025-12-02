'use client';
import React from "react";
import { useAuth } from "../context/AuthProvider"; // hook do Auth0
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
  const { login, user, loading } = useAuth();
  const router = useRouter();

  // Redireciona automaticamente se já estiver logado
  React.useEffect(() => {
    if (user) {
      router.push("/dashboard"); // ou /admin/dashboard conforme sua lógica
    }
  }, [user, router]);

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

          {/* BOTÃO DE LOGIN COM AUTH0 */}
          <button
            type="button"
            onClick={login}
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

          <div className="mt-8 text-center text-sm text-gray-500">
            Todos os logins sociais (Google/GitHub) serão tratados automaticamente pelo Auth0.
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
