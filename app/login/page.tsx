'use client';
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const COLOR_PRIMARY = "#123859";
const COLOR_ACCENT = "#F9941F";

const InvoiceIcon = ({ sizeClass = "w-10 h-10", color = COLOR_PRIMARY }) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    className={sizeClass}
    style={{ color }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    whileHover={{ scale: 1.1, rotate: 10 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </motion.svg>
);

export default function LoginPage() {
  const router = useRouter();

  // Se houver lógica de sessão SPA, você pode adicionar aqui
  useEffect(() => {
    // Exemplo: se já estiver logado, redirecionar
    // router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-inter relative overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#123859] via-[#F9941F] to-[#123859] animate-gradient-x opacity-20 z-0"></div>

      <motion.div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Lado esquerdo */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 xl:p-16 text-white w-1/2" style={{ backgroundColor: COLOR_PRIMARY }}>
          <InvoiceIcon sizeClass="w-24 h-24 mb-4" color={COLOR_ACCENT} />
          <h2 className="text-5xl font-extrabold text-center mb-4 text-white">
            Fatura<span style={{ color: COLOR_ACCENT }}>Já</span>
          </h2>
          <p className="text-xl text-center leading-relaxed text-gray-200">
            Plataforma inteligente para faturação rápida e compatível.
          </p>
        </div>

        {/* Lado direito */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center items-center">
          <InvoiceIcon sizeClass="w-16 h-16 mb-4 lg:hidden" color={COLOR_PRIMARY} />
          <h2 className="text-3xl font-extrabold mt-2 text-[#123859] text-center">
            Bem-vindo ao <span style={{ color: COLOR_ACCENT }}>FaturaJá</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-6 text-center">
            Faça login e comece a faturar de forma rápida e segura.
          </p>

          {/* BOTÕES DE LOGIN SOCIAL VIA LARAVEL */}
          <motion.button
            type="button"
            onClick={() => window.location.href = "http://localhost:8000/auth/redirect/google"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-xl font-semibold transition flex justify-center items-center mb-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Login com Google
          </motion.button>

          <motion.button
            type="button"
            onClick={() => window.location.href = "http://localhost:8000/auth/redirect/github"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-xl font-semibold transition flex justify-center items-center mb-4 bg-black hover:bg-gray-800 text-white"
          >
            Login com GitHub
          </motion.button>

          <motion.button
            type="button"
            onClick={() => window.location.href = "http://localhost:8000/auth/redirect/linkedin"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-xl font-semibold transition flex justify-center items-center mb-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Login com LinkedIn
          </motion.button>

          <p className="text-center text-sm text-gray-500">
            Todos os logins sociais via Auth0 no backend Laravel
          </p>
        </div>
      </motion.div>
    </div>
  );
}
