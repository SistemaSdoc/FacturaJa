'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainAdmin from '../../../components/MainAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Fatura {
  id: number;
  data: string;
  valor: number;
  status: 'Pago' | 'Pendente' | 'Atrasado';
}

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  endereco: string;
  faturas: Fatura[];
}

export default function ClienteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCliente({
        id: Number(id),
        nome: `Cliente ${id}`,
        email: `cliente${id}@email.com`,
        telefone: `9123456${id}`,
        status: 'Ativo',
        endereco: 'Rua Exemplo, 123, Luanda',
        faturas: [
          { id: 101, data: '2025-11-01', valor: 1500, status: 'Pago' },
          { id: 102, data: '2025-11-10', valor: 800, status: 'Pendente' },
          { id: 103, data: '2025-11-15', valor: 1200, status: 'Atrasado' },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <p className="p-6 text-center">Carregando cliente...</p>;
  if (!cliente) return <p className="p-6 text-center text-red-500">Cliente não encontrado.</p>;

  const getStatusColor = (status: Cliente['status'] | Fatura['status']) => {
    switch (status) {
      case 'Ativo': return 'bg-green-500 text-white';
      case 'Inativo': return 'bg-red-500 text-white';
      case 'Pago': return 'bg-green-500 text-white';
      case 'Pendente': return 'bg-yellow-500 text-white';
      case 'Atrasado': return 'bg-red-500 text-white';
      default: return '';
    }
  };

  return (
    <MainAdmin>
      <div className="p-4 space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/usuarios')}>
          <ArrowLeft size={16} /> Voltar
        </Button>

        <h1 className="text-2xl font-bold text-[#123859]">{cliente.nome}</h1>
        <Badge className={getStatusColor(cliente.status)}>{cliente.status}</Badge>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="faturas">Faturas</TabsTrigger>
          </TabsList>

          {/* Informações */}
          <TabsContent value="info">
            <Card>
              <CardContent className="space-y-2">
                <p><strong>Email:</strong> {cliente.email}</p>
                <p><strong>Telefone:</strong> {cliente.telefone}</p>
                <p><strong>Endereço:</strong> {cliente.endereco}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faturas */}
          <TabsContent value="faturas">
            {cliente.faturas.map(f => (
              <Card key={f.id} className="mb-2">
                <CardContent className="flex justify-between items-center">
                  <div>
                    <p><strong>ID:</strong> {f.id}</p>
                    <p><strong>Data:</strong> {f.data}</p>
                    <p><strong>Valor:</strong> € {f.valor}</p>
                  </div>
                  <Badge className={getStatusColor(f.status)}>{f.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MainAdmin>
  );
}
