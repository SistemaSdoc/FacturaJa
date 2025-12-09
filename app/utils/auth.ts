// utils/auth.js

import api from "../services/axios";

// Função para login
export async function login(email, password, empresa_slug) {
  await api.get("/sanctum/csrf-cookie"); // necessário para cookies CSRF
  const res = await api.post("/logar", { email, password, empresa_slug });
  return res.data; // retorna { user, empresa }
}

// Função para logout
export async function logout() {
  const res = await api.post("/logout");
  return res.data;
}

// Função para pegar usuário autenticado
export async function getUser() {
  const res = await api.get("/user");
  return res.data;
}

// Função para pegar empresa autenticada
export async function getEmpresaAuth() {
  const res = await api.get("/empresa");
  return res.data;
}
