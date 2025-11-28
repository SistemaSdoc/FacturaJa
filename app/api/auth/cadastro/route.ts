import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { empresaNome, empresaNIF, email, senha } = body;

    if (!empresaNome || !empresaNIF || !email || !senha) {
      return NextResponse.json(
        { message: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Chama o backend Laravel
    const response = await fetch("https://seu-backend.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa: { nome: empresaNome, nif: empresaNIF },
        usuario: { email, senha },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Erro no cadastro." }, { status: response.status });
    }

    // Retornar token + role (opcional)
    return NextResponse.json({
      token: data.token,
      role: data.role,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erro de servidor." }, { status: 500 });
  }
}
