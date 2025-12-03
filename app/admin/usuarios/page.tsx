'use client';
import React, { useEffect, useState } from 'react';
import MainAdmin from '../../components/MainAdmin';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash, Eye } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'Admin' | 'Usuário' | 'Financeiro';
  empresa: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'Todos' | 'Admin' | 'Usuário' | 'Financeiro'>('Todos');
  const [filterEmpresa, setFilterEmpresa] = useState<'Todos' | string>('Todos');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsuarios([
        { id: 1, nome: 'João Silva', email: 'joao@email.com', role: 'Admin', empresa: 'Empresa A' },
        { id: 2, nome: 'Maria Costa', email: 'maria@email.com', role: 'Usuário', empresa: 'Empresa B' },
        { id: 3, nome: 'Carlos Pereira', email: 'carlos@email.com', role: 'Financeiro', empresa: 'Empresa A' },
        { id: 4, nome: 'Ana Lima', email: 'ana@email.com', role: 'Usuário', empresa: 'Empresa C' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const empresas = Array.from(new Set(usuarios.map(u => u.empresa)));

  const filtered = usuarios.filter(u =>
    (filterRole === 'Todos' || u.role === filterRole) &&
    (filterEmpresa === 'Todos' || u.empresa === filterEmpresa) &&
    (u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRoleChange = (id: number, newRole: Usuario['role']) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  };

  const getRoleColor = (role: Usuario['role']) => {
    switch (role) {
      case 'Admin': return 'bg-red-500 text-white';
      case 'Usuário': return 'bg-blue-500 text-white';
      case 'Financeiro': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) return <p className="p-6 text-center">Carregando usuários...</p>;

  return (
    <MainAdmin>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-[#123859]">Usuários</h1>

        {/* Filtros */}
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-2 items-center">
            <Input
              placeholder="Procurar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            <Select value={filterRole} onValueChange={(val) => setFilterRole(val as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Usuário">Usuário</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEmpresa} onValueChange={(val) => setFilterEmpresa(val)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as Empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {empresas.map(emp => <SelectItem key={emp} value={emp}>{emp}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tabela de usuários */}
        <Card>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.empresa}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/usuarios/${u.id}`)} className="flex items-center gap-1">
                        <Eye size={16} /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center p-6 text-gray-500">Nenhum usuário encontrado.</TableCell>
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
