'use client';
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainCliente from "../../../../components/MainCliente";

// ShadCN/UI imports (ajusta caminhos se necessário)
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  items: LineItem[];
}

export default function PayInvoicePage() {
  const { public_id } = useParams();
  const router = useRouter();
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [metodo, setMetodo] = useState<"Pix" | "Cartão" | "Boleto">("Pix");

  useEffect(() => {
    setLoading(true);
    const mockFatura: Fatura = {
      id: Number(public_id),
      numero: "001",
      cliente: "João Silva",
      data: "2025-11-01",
      vencimento: "2025-11-10",
      total: 120,
      status: "Pendente",
      items: [
        { id: 1, descricao: "Produto A", quantidade: 2, precoUnitario: 30, impostoPercent: 0 },
        { id: 2, descricao: "Serviço B", quantidade: 1, precoUnitario: 60, impostoPercent: 0 },
      ],
    };
    const t = setTimeout(() => {
      setFatura(mockFatura);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [public_id]);

  const computeTotals = (items: LineItem[]) => {
    let subtotal = 0,
      imposto = 0;
    items.forEach((i) => {
      const line = i.quantidade * i.precoUnitario;
      subtotal += line;
      imposto += line * (i.impostoPercent / 100);
    });
    return { subtotal, imposto, total: subtotal + imposto };
  };

  const handlePay = () => {
    // Simulação; aqui integrarás com a tua API/checkout real
    alert(`Simulando pagamento via ${metodo} de €${fatura?.total.toFixed(2)}`);
    // opcional: redirecionar para histórico ou página de sucesso
    // router.push('/cliente/invoices');
  };

  if (loading) return <p className="p-6 text-center" style={{ color: "var(--primary)" }}>Carregando fatura...</p>;
  if (!fatura) return <p className="p-6 text-center" style={{ color: "var(--primary)" }}>Fatura não encontrada.</p>;

  const totals = computeTotals(fatura.items);

  // classes responsivas e que usam variáveis de tema
  const cardClass = "w-full max-w-4xl mx-auto transition-colors duration-300";
  const itemRowClass = "flex justify-between items-start gap-4 w-full";

  return (
    <MainCliente>
      <Card className={cardClass}>
        <CardHeader className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                Pagar Fatura #{fatura.numero}
              </CardTitle>
              <div className="mt-1 text-sm" style={{ color: "var(--primary)" }}>
                <div><strong>Cliente:</strong> {fatura.cliente}</div>
                <div><strong>Data:</strong> {fatura.data} &nbsp; <strong>Vencimento:</strong> {fatura.vencimento}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm" style={{ color: "var(--primary)" }}>Subtotal</div>
                <div className="text-lg font-semibold" style={{ color: "var(--primary)" }}>€ {totals.subtotal.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ color: "var(--primary)" }}>Imposto</div>
                <div className="text-lg font-semibold" style={{ color: "var(--primary)" }}>€ {totals.imposto.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ color: "var(--primary)" }}>Total</div>
                <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>€ {totals.total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-6">
          {/* Items list (responsive) */}
          <div className="space-y-3">
            {fatura.items.map((it) => (
              <div key={it.id} className={`${itemRowClass} bg-transparent md:bg-var(--card)`} >
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium" style={{ color: "var(--primary)" }}>{it.descricao}</div>
                      <div className="text-sm" style={{ color: "var(--primary)" }}>
                        {it.quantidade} x €{it.precoUnitario.toFixed(2)} {it.impostoPercent > 0 && `• ${it.impostoPercent}% imposto`}
                      </div>
                    </div>
                    <div className="ml-2 text-sm font-medium" style={{ color: "var(--primary)" }}>
                      € {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent / 100)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Métodos de pagamento - responsivo */}
          <div className="mb-6">
            <p className="font-semibold mb-3" style={{ color: "var(--primary)" }}>Escolher método de pagamento</p>

            <div className="flex flex-col sm:flex-row gap-2">
              {(["Pix", "Cartão", "Boleto"] as const).map((m) => {
                const active = metodo === m;
                return (
                  <Button
                    key={m}
                    size="sm"
                    variant={active ? undefined : "ghost"}
                    onClick={() => setMetodo(m)}
                    className={`px-4 py-2 rounded-md ${active ? "" : ""}`}
                    style={
                      active
                        ? { background: "var(--accent)", color: "var(--text-on-dark)" }
                        : { background: "var(--surface)", color: "var(--primary)" }
                    }
                  >
                    {m}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Mobile-friendly summary + pay */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm" style={{ color: "var(--primary)" }}>Método selecionado:</div>
              <div className="text-lg font-medium" style={{ color: "var(--accent)" }}>{metodo}</div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/cliente/invoices/view/${fatura.id}`)}>
                Ver Fatura
              </Button>

              <Button
                size="sm"
                onClick={handlePay}
                style={{ background: "var(--accent)", color: "var(--text-on-dark)" }}
              >
                Pagar €{fatura.total.toFixed(2)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainCliente>
  );
}
