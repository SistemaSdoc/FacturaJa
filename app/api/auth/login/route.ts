// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    // Chama o backend do Laravel
    const response = await fetch('https://seu-backend.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Erro no login.' }, { status: response.status });
    }

    // data deve conter token e role
    // Exemplo: { token: 'abc123', role: 'admin' }
    return NextResponse.json({
      token: data.token,
      role: data.role,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Erro de servidor.' }, { status: 500 });
  }
}
