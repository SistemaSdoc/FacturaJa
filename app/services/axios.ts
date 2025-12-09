import axios from "axios";

// Base URL da API
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : "http://localhost:8000/api";

// Instância principal do Axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
  withXSRFToken: true,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// ----------------- Interceptor de respostas -----------------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error("[API Error]", { status, data, message: err.message });

    // Redireciona para login se 401
    if (typeof window !== "undefined" && status === 401) {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

// ----------------- Funções de API -----------------

// Primeiro pega CSRF cookie (Sanctum)
export async function getCsrfCookie() {
  try {
    await api.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`);
  } catch (error) {
    console.error("Erro ao pegar CSRF cookie:", error);
    throw error;
  }
}

// Login
export async function login(email: string, password: string, empresa_slug: string) {
  try {
    await getCsrfCookie(); // 🔑 pega CSRF token antes do POST
    const response = await api.post("/login", { email, password, empresa_slug });
    return response.data;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    if (error.request) throw { message: "Sem resposta do servidor" };
    throw { message: error.message };
  }
}

// Registro
export async function register(
  name: string,
  email: string,
  password: string,
  empresa_nome: string,
  empresa_slug: string,
  telefone?: string,
  endereco?: string
) {
  try {
    await getCsrfCookie();
    const response = await api.post("/register", {
      name,
      email,
      password,
      empresa_nome,
      empresa_slug,
      telefone,
      endereco,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    if (error.request) throw { message: "Sem resposta do servidor" };
    throw { message: error.message };
  }
}

// Logout
export async function logout() {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (error: any) {
    console.error("Erro no logout:", error.response?.data || error.message);
    throw error;
  }
}

// Pega usuário autenticado
export async function getUser() {
  try {
    const response = await api.get("/dashboard");
    return response.data.user;
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error.response?.data || error.message);
    throw error;
  }
}

// Pega empresa do usuário autenticado
export async function getEmpresaAuth() {
  try {
    const response = await api.get("/dashboard");
    return response.data.empresa;
  } catch (error: any) {
    console.error("Erro ao buscar empresa (auth):", error.response?.data || error.message);
    throw error;
  }
}

// Pega empresa por slug (rota pública)
export async function getEmpresaBySlug(slug: string) {
  try {
    const response = await api.get(`/empresa/slug/${encodeURIComponent(slug)}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar empresa por slug:", error.response?.data || error.message);
    throw error;
  }
}

// Normaliza URL da logo (relativa ou absoluta)
export function normalizeLogoUrl(logoPath?: string | null) {
  if (!logoPath) return null;
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;

  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${base.replace(/\/$/, "")}/${logoPath.replace(/^\/+/, "")}`;
}

export default api;
