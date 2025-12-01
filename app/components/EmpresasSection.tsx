"use client";
import React from "react";
import { motion } from "framer-motion";

const empresas = [
  { name: "AngoTech", logo: "/faturaja/public/images/Gestão de Clientes.webp", website: "https://angotech.ao" },
  { name: "Cabenda Corp", logo: "../../images/Relatórios e Estatísticas.webp", website: "https://cabenda.ao" },
  { name: "IMCL", logo: "/logos/imcl.png", website: "https://imcl.ao" },
  { name: "EngePlus", logo: "/logos/engeplus.png", website: "https://engeplus.ao" },
  { name: "TechNova", logo: "/logos/technova.png", website: "https://technova.ao" },
  { name: "NextGen", logo: "/logos/nextgen.png", website: "https://nextgen.ao" },
];

const EmpresasSection = () => {
  return (
    <section id="empresas" className="py-16 md:py-24 bg-[#F2F2F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-[#123859]">
          Empresas que Confiam no <span className="text-[#F9941F]">FaturaJá</span>
        </h2>

        {/* Carrossel bidirecional */}
        <div className="overflow-hidden relative">
          <motion.div
            className="flex space-x-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            }}
          >
            {empresas.concat(empresas).map((empresa, idx) => (
              <motion.a
                key={idx}
                href={empresa.website}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center min-w-[120px] md:min-w-[160px] transition-transform transform hover:scale-110"
                whileHover={{ scale: 1.2 }}
              >
                <img
                  src={empresa.logo}
                  alt={empresa.name}
                  className="h-16 md:h-20 object-contain grayscale hover:grayscale-0 transition duration-300"
                />
                {/* Tooltip */}
                <span className="absolute bottom-0 mb-10 opacity-0 group-hover:opacity-100 text-sm text-[#123859] bg-white rounded px-2 py-1 shadow-lg transition-opacity duration-300">
                  {empresa.name}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EmpresasSection;
