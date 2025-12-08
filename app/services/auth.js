// services/auth.js
import api from "./axios";

/**
 * Faz login com Sanctum
 * - Primeiro requisita o CSRF cookie
 * - Depois envia email e password para /login
 */
export const login = async (email, password, ) => {
  try {
    // 1️⃣ Pega CSRF cookie
    await api.get("/sanctum/csrf-cookie");

    // 2️⃣ Faz login (rota padrão do Laravel)
    const response = await api.post("/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Erro no login:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Faz logout do usuário autenticado
 */
export const logout = async () => {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (error) {
    console.error("Erro no logout:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Retorna os dados do usuário autenticado
 */
export const getUser = async () => {
  try {
    const response = await api.get("/api/user");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error.response?.data || error.message);
    throw error;
  }
};
