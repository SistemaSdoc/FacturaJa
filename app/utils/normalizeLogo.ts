export function normalizeLogoUrl(
    logoPath?: string | null,
    empresaSlug?: string | null
): string | null {
    if (!logoPath) return null;

    // Se já for uma URL absoluta
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
        return logoPath;
    }

    // Base da API
    const base =
        typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL
            : "http://localhost:8000";

    // Se tiver slug da empresa, monta caminho baseado nele
    if (empresaSlug) {
        return `${base.replace(/\/$/, "")}/storage/empresas/${empresaSlug}/${logoPath.replace(/^\/+/, "")}`;
    }

    // Caso contrário, usa caminho direto
    return `${base.replace(/\/$/, "")}/${logoPath.replace(/^\/+/, "")}`;
}
