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

  if (loading) return <p className="p-6 text-center text-[var(--primary)]">Carregando empresas...</p>;

  return (
    <MainAdmin>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Empresas</h1>

        {/* Filtros */}
        <Card className="bg-[var(--surface)]">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-2 items-center">
            <input
              type="text"
              placeholder="Procurar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 rounded flex-1 border border-[var(--sidebar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--primary)]"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="p-2 rounded border border-[var(--sidebar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--primary)]"
            >
              <option value="Todos">Todos</option>
              <option value="Ativa">Ativa</option>
              <option value="Inativa">Inativa</option>
            </select>
          </CardContent>
        </Card>

        {/* Tabela de empresas */}
        <Card className="bg-[var(--surface)]">
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[var(--primary)]">ID</TableHead>
                  <TableHead className="text-[var(--primary)]">Nome</TableHead>
                  <TableHead className="text-[var(--primary)]">Email</TableHead>
                  <TableHead className="text-[var(--primary)]">Telefone</TableHead>
                  <TableHead className="text-[var(--primary)]">Status</TableHead>
                  <TableHead className="text-[var(--primary)]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id} className="hover:bg-[var(--accent)]/10 transition-colors">
                    <TableCell className="text-[var(--primary)]">{e.id}</TableCell>
                    <TableCell className="font-medium text-[var(--primary)]">{e.nome}</TableCell>
                    <TableCell className="text-[var(--primary)]">{e.email}</TableCell>
                    <TableCell className="text-[var(--primary)]">{e.telefone}</TableCell>
                    <TableCell className={e.status === 'Ativa' ? 'text-green-600' : 'text-red-600'}>
                      {e.status}
                    </TableCell>
                    <TableCell className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/empresas/${e.id}`)}
                        className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--primary)]/70">
                      Nenhuma empresa encontrada.
                    </TableCell>
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
