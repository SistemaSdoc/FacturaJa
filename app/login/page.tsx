'use client';
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
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
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

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

          {/* BOTÃO LOGIN SOCIAL */}
          <motion.button
            type="button"
            onClick={login}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full py-3 rounded-xl font-semibold transition flex justify-center items-center mb-4 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#123859] hover:bg-[#F9941F] text-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Carregando...
              </span>
            ) : (
              "Iniciar Sessão com Auth0"
            )}
          </motion.button>

          <p className="text-center text-sm text-gray-500">
            Logins sociais (Google/GitHub) via Auth0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
