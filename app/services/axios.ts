// services/axios.ts
import axios, { AxiosRequestConfig } from "axios";

// ----------------- TIPAGENS -----------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cliente";
  status?: "Ativo" | "Inativo";
  telefone?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  database_name: string;
}

export interface AuthResponse {
  success?: boolean;
  user?: User;
  tenant?: Tenant | string;
  token?: string;
  redirect?: string;
  message?: string;
}

// ----------------- VALIDAÇÃO DE VARIÁVEL DE AMBIENTE -----------------
if (!process.env.NEXT_PUBLIC_API_URL) {
  if (typeof window !== "undefined") {
    alert("Variável NEXT_PUBLIC_API_URL não definida! (Veja .env.local)");
  }
  throw new Error(
    "NEXT_PUBLIC_API_URL não definida! Configure no arquivo .env.local"
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");

// ----------------- INSTÂNCIA PRINCIPAL DO AXIOS -----------------
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
  timeout: 10000,
});

// ----------------- INTERCEPTOR DE AUTENTICAÇÃO -----------------
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const tenant = typeof window !== "undefined" ? localStorage.getItem("tenant") : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Não envia X-Tenant em rotas globais (/login, /register)
  const isGlobalAuthRoute =
    config.url?.includes("/login") || config.url?.includes("/register");

  if (tenant && config.headers && !isGlobalAuthRoute) {
    config.headers["X-Tenant"] = tenant;
  }

  return config;
});

// ----------------- INTERCEPTOR DE ERROS -----------------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const url = err?.config?.url;
    console.error("[API Error]", { status, url, data, message: err.message, raw: err });

    if (typeof window !== "undefined" && status === 401) {
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("tenant");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

// ----------------- AUTENTICAÇÃO MULTI-TENANT -----------------
export async function login(
  email: string,
  password: string,
  tenantSubdomain: string
): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `http://${tenantSubdomain}.faturaja.sdoca:8000/authenticate`,
      { email, password },
      { withCredentials: true }
    );

    if (response.data?.token) localStorage.setItem("token", response.data.token);

    if (response.data?.tenant) {
      const tenant =
        typeof response.data.tenant === "string"
          ? response.data.tenant
          : (response.data.tenant as Tenant).subdomain;
      localStorage.setItem("tenant", tenant);
    }

    return {
      ...response.data,
      success: true,
      redirect: response.data.redirect || "/dashboard",
    };
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
  password_confirmation?: string
): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/register", {
      name,
      email,
      password,
      password_confirmation: password_confirmation || password,
    });
    return { ...response.data, success: true };
  } catch (error: any) {
    if (error.response) throw error.response.data;
    if (error.request) throw { message: "Sem resposta do servidor" };
    throw { message: error.message || "Erro desconhecido", error };
  }
}

export async function logout() {
  try {
    await api.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("tenant");
    return { success: true, message: "Logout efetuado com sucesso" };
  } catch (error: any) {
    console.error("Erro no logout:", error);
    throw { message: "Não foi possível deslogar", error };
  }
}

// ----------------- USUÁRIO / TENANT -----------------
export async function getUser(): Promise<User> {
  const response = await api.get("/tenant-info");
  if (!response.data?.user) throw { message: "Usuário não encontrado" };
  return response.data.user;
}

export async function getTenant(): Promise<Tenant> {
  const response = await api.get("/tenant-info");
  if (!response.data?.tenant) throw { message: "Tenant não encontrado" };
  return response.data.tenant;
}

// ----------------- USERS -----------------
export async function getUsers(): Promise<User[]> {
  const response = await api.get("/users");
  return response.data;
}

export async function getUserById(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function createUser(user: Partial<User> & { password: string }): Promise<User> {
  const response = await api.post("/users", user);
  return response.data;
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

// ----------------- CLIENTES -----------------
export async function getClientes() {
  const response = await api.get("/clientes");
  return response.data;
}

export async function createCliente(cliente: any) {
  const response = await api.post("/clientes", cliente);
  return response.data;
}

export async function updateCliente(id: string, cliente: any) {
  const response = await api.put(`/clientes/${id}`, cliente);
  return response.data;
}

export async function deleteCliente(id: string) {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
}

// ----------------- NORMALIZAÇÃO DE LOGO -----------------
export function normalizeLogoUrl(logoPath?: string | null) {
  if (!logoPath) return null;
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
  return `${BASE_URL.replace(/\/$/, "")}/${logoPath.replace(/^\/+/, "")}`;
}

export default api;
