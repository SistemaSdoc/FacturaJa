'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainAdmin from '../../components/MainAdmin';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface Empresa {
  id: number;
  nome: string;
  status: 'Ativa' | 'Inativa';
  email: string;
  telefone: string;
}

export default function AdminEmpresasPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Ativa' | 'Inativa'>('Todos');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEmpresas([
        { id: 1, nome: 'Empresa A', status: 'Ativa', email: 'a@email.com', telefone: '912345678' },
        { id: 2, nome: 'Empresa B', status: 'Inativa', email: 'b@email.com', telefone: '912345679' },
        { id: 3, nome: 'Empresa C', status: 'Ativa', email: 'c@email.com', telefone: '912345680' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = empresas.filter(e =>
    (filterStatus === 'Todos' || e.status === filterStatus) &&
    (e.nome.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <p className="p-6 text-center">Carregando empresas...</p>;

  return (
    <MainAdmin>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-[#123859]">Empresas</h1>

        {/* Filtros */}
        <Card className="bg-[#F2F2F2]">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-2 items-center">
            <input
              type="text"
              placeholder="Procurar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 rounded flex-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#123859]"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#123859]"
            >
              <option value="Todos">Todos</option>
              <option value="Ativa">Ativa</option>
              <option value="Inativa">Inativa</option>
            </select>
          </CardContent>
        </Card>

        {/* Tabela de empresas */}
        <Card className="bg-[#F2F2F2]">
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id} className="hover:bg-gray-50">
                    <TableCell>{e.id}</TableCell>
                    <TableCell className="font-medium text-[#123859]">{e.nome}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.telefone}</TableCell>
                    <TableCell>{e.status}</TableCell>
                    <TableCell className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/empresas/${e.id}`)}>Ver</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">Nenhuma empresa encontrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainAdmin>
  );
}
