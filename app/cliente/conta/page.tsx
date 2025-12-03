'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainCliente from "../../components/MainCliente"; // ajuste o caminho conforme sua pasta

// ShadCN/UI imports (ajusta caminhos se necessário)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Status = "Pago" | "Pendente" | "Cancelada";

interface LineItem {
  id: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  impostoPercent: number;
}

interface Fatura {
  id: number;
  numero: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  items: LineItem[];
}

interface Cliente {
  nome: string;
  email: string;
  telefone: string;
}

export default function ClienteContaPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [clientAvatar, setClientAvatar] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const avatar = localStorage.getItem("clientAvatar") || "";
      if (avatar) setClientAvatar(avatar);
    } catch {}
  }, []);

  // Simula carregamento de dados
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setCliente({
        nome: "João Silva",
        email: "joao@email.com",
        telefone: "912345678",
      });
      setFaturas([
        {
          id: 1,
          numero: "001",
          data: "2025-11-01",
          vencimento: "2025-11-10",
          total: 120,
          status: "Pendente",
          items: [
            { id: 1, descricao: "Produto A", quantidade: 2, precoUnitario: 30, impostoPercent: 0 },
          ],
        },
        {
          id: 2,
          numero: "002",
          data: "2025-11-03",
          vencimento: "2025-11-12",
          total: 300,
          status: "Pago",
          items: [
            { id: 1, descricao: "Serviço X", quantidade: 1, precoUnitario: 300, impostoPercent: 0 },
          ],
        },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (!mounted) return null;
  if (loading) return <p className="p-6 text-center text-primary">Carregando...</p>;
  if (!cliente) return <p className="p-6 text-center text-red-500">Cliente não encontrado.</p>;

  const statusClass = (s: Status) =>
    s === "Pago" ? "text-green-500 bg-green-50 dark:bg-green-900/30 dark:text-green-300" :
    s === "Pendente" ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300" :
    "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300";

  return (
    <MainCliente>
      {/* PERFIL DO CLIENTE (responsivo) */}
      <Card className="w-full max-w-4xl mx-auto mb-6 transition-colors duration-300">
        <CardHeader className="flex flex-col items-center gap-2 p-6">
          <img
            src={clientAvatar || "/images/faturaja.png"}
            alt="Avatar do Cliente"
            className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-accent transition-all duration-200 hover:scale-105 mb-2"
          />
          <CardTitle className="text-2xl sm:text-xl font-bold text-accent">Perfil do Cliente</CardTitle>
          <div className="w-full max-w-xl mt-2 text-center sm:text-left">
            <p className="text-primary"><strong>Nome:</strong> {cliente.nome}</p>
            <p className="text-primary"><strong>Email:</strong> {cliente.email}</p>
            <p className="text-primary"><strong>Telefone:</strong> {cliente.telefone}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Faturas */}
      <Card className="w-full max-w-6xl mx-auto transition-colors duration-300">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-accent">Minhas Faturas</h3>
            <div>
              <Button variant="outline" size="sm" onClick={() => router.push("/cliente/invoices")}>
                Ver todas
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop / tablet: tabela */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[max-content] table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas.map((f) => (
                  <TableRow key={f.id} className="hover:bg-surface transition-colors duration-300">
                    <TableCell className="font-medium">{f.numero}</TableCell>
                    <TableCell>{f.data}</TableCell>
                    <TableCell>{f.vencimento}</TableCell>
                    <TableCell>€ {f.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded ${statusClass(f.status)}`}>
                        {f.status}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/cliente/invoices/view/${f.id}`)}>
                        Ver
                      </Button>
                      {f.status === "Pendente" && (
                        <Button variant="secondary" size="sm" onClick={() => router.push(`/cliente/invoices/pay/${f.id}`)}>
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {faturas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">Nenhuma fatura encontrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: cards empilhados */}
          <div className="block md:hidden px-4 py-4 space-y-4">
            {faturas.map((f) => (
              <article key={f.id} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-primary">#{f.numero}</h4>
                      <span className={`text-sm px-2 py-0.5 rounded ${statusClass(f.status)}`}>{f.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-primary">
                      <div><strong>Data:</strong> {f.data}</div>
                      <div><strong>Vencimento:</strong> {f.vencimento}</div>
                      <div className="mt-1"><strong>Total:</strong> € {f.total.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/cliente/invoices/view/${f.id}`)}>
                      Ver
                    </Button>
                    {f.status === "Pendente" && (
                      <Button variant="secondary" size="sm" onClick={() => router.push(`/cliente/invoices/pay/${f.id}`)}>
                        Pagar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Items (colapsível opcional) - mostrado sempre no mobile para facilitar visualização */}
                {f.items && f.items.length > 0 && (
                  <div className="mt-3 border-t pt-3 text-sm text-primary">
                    {f.items.map((it) => (
                      <div key={it.id} className="flex justify-between py-1">
                        <div>{it.descricao} x{it.quantidade}</div>
                        <div>€ {(it.precoUnitario * it.quantidade).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {faturas.length === 0 && (
              <div className="text-center text-gray-500">Nenhuma fatura encontrada.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainCliente>
  );
}
