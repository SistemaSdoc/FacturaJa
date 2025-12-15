// services/axios.ts
import axios from "axios";

// ----------------- VALIDAÇÃO DE VARIÁVEL DE AMBIENTE -----------------
if (!process.env.NEXT_PUBLIC_API_URL) {
  if (typeof window !== "undefined") {
    alert("Variável NEXT_PUBLIC_API_URL não definida! (Veja .env.local)");
  }
  throw new Error("NEXT_PUBLIC_API_URL não definida! Configure no arquivo .env.local");
}

// Base URL da API
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api`;

// ----------------- INSTÂNCIA PRINCIPAL DO AXIOS -----------------
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
  withCredentials: true,      // ESSENCIAL para Sanctum
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// ----------------- INTERCEPTOR DE ERROS -----------------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const url = err?.config?.url;
    console.error("[API Error]", { status, url, data, message: err.message });

    if (typeof window !== "undefined" && status === 401) {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ----------------- HELPER -----------------
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, "");
}

// ----------------- CSRF -----------------
export async function getCsrfCookie() {
  try {
    await axios.get(`${getBaseUrl()}/sanctum/csrf-cookie`, { withCredentials: true });
  } catch (error) {
    console.error("Erro ao pegar CSRF cookie:", error);
    throw { message: "Não foi possível obter CSRF cookie", original: error };
  }
}

// ----------------- AUTENTICAÇÃO -----------------
export async function login(email: string, password: string, empresa_slug: string) {
  try {
    await getCsrfCookie(); // garante CSRF antes do login
    const response = await api.post("/login", { email, password, empresa_slug });
    if (!response.data?.user) {
      throw { message: "Login falhou", response: response.data };
    }
    return response.data;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    if (error.request) throw { message: "Sem resposta do servidor" };
    throw { message: error.message || "Erro desconhecido", error };
  }
}

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
    await getCsrfCookie(); // garante CSRF antes do registro
    const response = await api.post("/register", { name, email, password, empresa_nome, empresa_slug, telefone, endereco });
    if (!response.data) throw { message: "Registro falhou", response: response.data };
    return response.data;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    if (error.request) throw { message: "Sem resposta do servidor" };
    throw { message: error.message || "Erro desconhecido", error };
  }
}

export async function logout() {
  try {
    await getCsrfCookie(); // garante CSRF antes do logout
    const response = await api.post("/logout");
    if (!response.data?.message) throw { message: "Logout falhou", response: response.data };
    return response.data;
  } catch (error: any) {
    console.error("Erro no logout:", error);
    throw { message: "Não foi possível deslogar", error };
  }
}

// ----------------- USUÁRIO / EMPRESA -----------------
export async function getUser() {
  try {
    const response = await api.get("/me");
    if (!response.data?.user) throw { message: "Usuário não encontrado", response: response.data };
    return response.data.user;
  } catch (error: any) {
    throw { message: "Não foi possível obter o usuário", error };
  }
}

export async function getEmpresaAuth() {
  try {
    const response = await api.get("/me");
    if (!response.data?.empresa) throw { message: "Empresa não encontrada", response: response.data };
    return response.data.empresa;
  } catch (error: any) {
    throw { message: "Não foi possível obter a empresa", error };
  }
}

export async function getEmpresaBySlug(slug: string) {
  try {
    const response = await api.get(`/empresa/slug/${encodeURIComponent(slug)}`);
    if (!response.data) throw { message: "Empresa não encontrada", response: response.data };
    return response.data;
  } catch (error: any) {
    throw { message: "Não foi possível buscar empresa por slug", error };
  }
}

// ----------------- CLIENTES -----------------
export async function getClientes() {
  await getCsrfCookie(); // garante CSRF antes da requisição
  try {
    const response = await api.get("/clientes");
    if (!response.data?.clientes) throw { message: "Nenhum cliente encontrado", response: response.data };
    return response.data.clientes;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    throw { message: "Erro ao buscar clientes", error };
  }
}

export async function getCliente(id: number) {
  await getCsrfCookie();
  try {
    const response = await api.get(`/clientes/${id}`);
    if (!response.data?.cliente) throw { message: "Cliente não encontrado", response: response.data };
    return response.data.cliente;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    throw { message: "Erro ao buscar cliente", error };
  }
}

export async function createCliente(data: { nome: string; email?: string; telefone?: string; endereco?: string }) {
  await getCsrfCookie();
  try {
    const response = await api.post("/clientes", data);
    if (!response.data?.cliente) throw { message: "Falha ao criar cliente", response: response.data };
    return response.data.cliente;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    throw { message: "Erro ao criar cliente", error };
  }
}

export async function updateCliente(id: number, data: { nome: string; email?: string; telefone?: string; endereco?: string }) {
  await getCsrfCookie();
  try {
    const response = await api.put(`/clientes/${id}`, data);
    if (!response.data?.cliente) throw { message: "Falha ao atualizar cliente", response: response.data };
    return response.data.cliente;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    throw { message: "Erro ao atualizar cliente", error };
  }
}

export async function deleteCliente(id: number) {
  await getCsrfCookie();
  try {
    const response = await api.delete(`/clientes/${id}`);
    if (!response.data?.message) throw { message: "Falha ao remover cliente", response: response.data };
    return response.data;
  } catch (error: any) {
    if (error.response) throw error.response.data;
    throw { message: "Erro ao deletar cliente", error };
  }
}

// ----------------- NORMALIZAÇÃO DE LOGO -----------------
export function normalizeLogoUrl(logoPath?: string | null) {
  if (!logoPath) return null;
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${base.replace(/\/$/, "")}/${logoPath.replace(/^\/+/, "")}`;
}

export default api;
