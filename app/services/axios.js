import axios from "axios";

// Instância principal do Axios
const api = axios.create({
    baseURL: "http://localhost:8000", // URL do Laravel
    withCredentials: true,
    withXSRFToken: true,        // essencial para Sanctum (cookies de sessão)
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Função para login (agora aceita slug)
export async function login(email, password, empresa_slug) {
    try {
        // 1️⃣ Primeiro requisita o CSRF cookie
        await api.get("/sanctum/csrf-cookie");

        // 2️⃣ Depois faz o login (rota padrão do Laravel)
        const response = await api.post("/login", { email, password, empresa_slug });
        return response.data;
    } catch (error) {
        console.error("Erro no login:", error.response?.data || error.message);
        throw error;
    }
}

// Função para logout
export async function logout() {
    try {
        const response = await api.post("/logout");
        return response.data;
    } catch (error) {
        console.error("Erro no logout:", error.response?.data || error.message);
        throw error;
    }
}

// Função para pegar usuário autenticado
export async function getUser() {
    try {
        const response = await api.get("/api/user");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar usuário:", error.response?.data || error.message);
        throw error;
    }
}

export default api;
