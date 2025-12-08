'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainCliente from "../../../../components/MainCliente";
import * as XLSX from "xlsx";

// ShadCN/UI imports (ajusta caminhos se necessário)
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  cliente: string;
  data: string;
  vencimento: string;
  total: number;
  status: Status;
  items: LineItem[];
  notas?: string;
}

export default function ViewInvoicePage() {
  const { public_id } = useParams();
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [loading, setLoading] = useState(true);

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
      notas: "Obrigado pelo seu pagamento.",
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

  const handlePrint = () => window.print();
  const handleDownloadPDF = () => alert("Simular download PDF");
  const handlePay = () => alert("Simular pagamento (abrir checkout)");

  const handleExportExcel = () => {
    if (!fatura) return;

    const headerInfo = [
      { Informação: "Número da Fatura", Valor: fatura.numero },
      { Informação: "Cliente", Valor: fatura.cliente },
      { Informação: "Data", Valor: fatura.data },
      { Informação: "Vencimento", Valor: fatura.vencimento },
      { Informação: "Status", Valor: fatura.status },
      {},
    ];

    const itemsData = fatura.items.map((item) => ({
      Descrição: item.descricao,
      Quantidade: item.quantidade,
      "Preço Unitário (€)": item.precoUnitario.toFixed(2),
      "Imposto (%)": item.impostoPercent,
      Total: (item.quantidade * item.precoUnitario * (1 + item.impostoPercent / 100)).toFixed(2),
    }));

    const totalsData = [
      {},
      { Descrição: "Subtotal", Total: computeTotals(fatura.items).subtotal.toFixed(2) },
      { Descrição: "Imposto", Total: computeTotals(fatura.items).imposto.toFixed(2) },
      { Descrição: "Total", Total: computeTotals(fatura.items).total.toFixed(2) },
    ];

    const wsData = [...headerInfo, ...itemsData, ...totalsData];

    const ws = XLSX.utils.json_to_sheet(wsData, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Fatura ${fatura.numero}`);
    XLSX.writeFile(wb, `Fatura_${fatura.numero}.xlsx`);
  };

  if (loading) return <p className="p-6 text-center" style={{ color: "var(--primary)" }}>Carregando fatura...</p>;
  if (!fatura) return <p className="p-6 text-center" style={{ color: "var(--primary)" }}>Fatura não encontrada.</p>;

  const totals = computeTotals(fatura.items);
  const cardClass = "w-full max-w-4xl mx-auto transition-colors duration-300";

  // helper status classes (usa variáveis CSS para cores principais)
  const statusBadge = (s: Status) =>
    s === "Pago"
      ? "inline-block px-3 py-1 rounded font-semibold text-green-700 bg-green-100"
      : s === "Pendente"
      ? "inline-block px-3 py-1 rounded font-semibold text-yellow-800 bg-yellow-100"
      : "inline-block px-3 py-1 rounded font-semibold text-red-700 bg-red-100";

  return (
    <MainCliente>
      <Card className={cardClass}>
        <CardHeader className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                Fatura {fatura.numero}
              </CardTitle>
              <div className="mt-1 text-sm" style={{ color: "var(--primary)" }}>
                <div><strong>Cliente:</strong> {fatura.cliente}</div>
                <div><strong>Data / Vencimento:</strong> {fatura.data} / {fatura.vencimento}</div>
              </div>
            </div>

            <div className="mt-2 md:mt-0">
              <span className={statusBadge(fatura.status)}>{fatura.status}</span>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-6">
          {/* Desktop/tablet: tabela */}
          <div className="hidden md:block overflow-x-auto mb-6">
            <Table className="min-w-[max-content] table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Imposto</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fatura.items.map((it) => (
                  <TableRow key={it.id} className="hover:bg-surface transition-colors duration-200">
                    <TableCell style={{ color: "var(--primary)" }}>{it.descricao}</TableCell>
                    <TableCell style={{ color: "var(--primary)" }}>{it.quantidade}</TableCell>
                    <TableCell style={{ color: "var(--primary)" }}>€ {it.precoUnitario.toFixed(2)}</TableCell>
                    <TableCell style={{ color: "var(--primary)" }}>{it.impostoPercent}%</TableCell>
                    <TableCell style={{ color: "var(--primary)" }}>€ {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent / 100)).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: cards empilhados */}
          <div className="block md:hidden space-y-4 mb-6">
            {fatura.items.map((it) => (
              <article key={it.id} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>{it.descricao}</h4>
                    <div className="mt-1 text-sm" style={{ color: "var(--primary)" }}>
                      {it.quantidade} × €{it.precoUnitario.toFixed(2)}
                      {it.impostoPercent > 0 && <span className="ml-2">• {it.impostoPercent}% imposto</span>}
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                    € {(it.quantidade * it.precoUnitario * (1 + it.impostoPercent / 100)).toFixed(2)}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Totais */}
          <div className="text-right mb-6" style={{ color: "var(--primary)" }}>
            <p><strong>Subtotal:</strong> € {totals.subtotal.toFixed(2)}</p>
            <p><strong>Imposto:</strong> € {totals.imposto.toFixed(2)}</p>
            <p className="text-lg font-bold"><strong>Total:</strong> € {totals.total.toFixed(2)}</p>
          </div>

          {/* Notas */}
          {fatura.notas && (
            <div className="bg-card p-3 rounded mb-6" style={{ color: "var(--primary)" }}>
              <strong>Notas:</strong>
              <p className="mt-1">{fatura.notas}</p>
            </div>
          )}

          {/* Ações (escondidas no print) */}
          <div className="flex flex-col md:flex-row gap-2 justify-end print:hidden">
            {fatura.status === "Pendente" && (
              <Button onClick={handlePay} style={{ background: "var(--accent)", color: "var(--text-on-dark)" }}>
                Pagar
              </Button>
            )}
            <Button onClick={handlePrint} variant="outline">Imprimir</Button>
            <Button onClick={handleDownloadPDF} variant="outline">Download PDF</Button>
            <Button onClick={handleExportExcel} variant="ghost">Exportar Excel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Print-friendly tweaks (mantido) */}
      <style jsx global>{`
        @media print {
          body, html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            background-color: var(--bg) !important;
            color: var(--text-on-dark) !important;
          }
          div, p, ul, li, table, th, td {
            background-color: inherit !important;
            color: inherit !important;
            border-color: #ccc !important;
          }
          button, a[role="button"] {
            display: none !important;
          }
        }
      `}</style>
    </MainCliente>
  );
}
