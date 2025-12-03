'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainAdmin from '../../../components/MainAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash, Edit, Check, X } from 'lucide-react'; // ícones

interface Empresa {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: 'Ativa' | 'Inativa';
  nif: string;
  regimeFiscal: string;
  series: { id: number; nome: string; ativo: boolean }[];
  usuarios: { id: number; nome: string; email: string; role: string }[];
}

export default function EmpresaDetailPage() {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarioFilter, setUsuarioFilter] = useState<'Todos' | 'Admin' | 'Usuário'>('Todos');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEmpresa({
        id: Number(id),
        nome: `Empresa ${id}`,
        email: `empresa${id}@email.com`,
        telefone: `9123456${id}`,
        status: id === '2' ? 'Inativa' : 'Ativa',
        nif: `12345678${id}`,
        regimeFiscal: 'Simplificado',
        series: [
          { id: 1, nome: `Série A${id}`, ativo: true },
          { id: 2, nome: `Série B${id}`, ativo: false },
        ],
        usuarios: [
          { id: 1, nome: 'João Silva', email: 'joao@email.com', role: 'Admin' },
          { id: 2, nome: 'Maria Costa', email: 'maria@email.com', role: 'Usuário' },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <p className="p-6 text-center">Carregando empresa...</p>;
  if (!empresa) return <p className="p-6 text-center text-red-500">Empresa não encontrada.</p>;

  const handleSave = () => alert(`Dados salvos para ${empresa.nome}`);
  const handleToggleSeries = (serieId: number) => {
    setEmpresa(prev => {
      if (!prev) return prev;
      const updatedSeries = prev.series.map(s => s.id === serieId ? { ...s, ativo: !s.ativo } : s);
      return { ...prev, series: updatedSeries };
    });
  };

  const filteredUsuarios = empresa.usuarios.filter(u => usuarioFilter === 'Todos' || u.role === usuarioFilter);

  return (
    <MainAdmin>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-[#123859]">Empresa {empresa.id} - {empresa.nome}</h1>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="fiscal">Configuração Fiscal</TabsTrigger>
            <TabsTrigger value="series">Séries</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          </TabsList>

          {/* Informações */}
          <TabsContent value="info">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block font-semibold">Nome</label>
                  <Input
                    type="text"
                    value={empresa.nome}
                    onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold">Email</label>
                  <Input
                    type="email"
                    value={empresa.email}
                    onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold">Telefone</label>
                  <Input
                    type="text"
                    value={empresa.telefone}
                    onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold">Status</label>
                  <Select
                    value={empresa.status}
                    onValueChange={(value) => setEmpresa({ ...empresa, status: value as 'Ativa' | 'Inativa' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave}>Salvar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuração Fiscal */}
          <TabsContent value="fiscal">
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <label className="block font-semibold">NIF</label>
                  <Input
                    type="text"
                    value={empresa.nif}
                    onChange={(e) => setEmpresa({ ...empresa, nif: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold">Regime Fiscal</label>
                  <Input
                    type="text"
                    value={empresa.regimeFiscal}
                    onChange={(e) => setEmpresa({ ...empresa, regimeFiscal: e.target.value })}
                  />
                </div>
                <Button onClick={handleSave}>Salvar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Séries */}
          <TabsContent value="series">
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresa.series.map(s => (
                      <TableRow key={s.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>{s.id}</TableCell>
                        <TableCell>{s.nome}</TableCell>
                        <TableCell>
                          <Badge variant={s.ativo ? 'success' : 'destructive'}>
                            {s.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleToggleSeries(s.id)} className="flex items-center gap-1">
                            {s.ativo ? <X size={16} /> : <Check size={16} />}
                            {s.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button size="sm" variant="ghost" className="flex items-center gap-1">
                            <Edit size={16} /> Editar
                          </Button>
                          <Button size="sm" variant="destructive" className="flex items-center gap-1">
                            <Trash size={16} /> Deletar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="usuarios">
            <Card>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-center mb-2">
                  <label className="font-semibold">Filtrar por Role:</label>
                  <Select value={usuarioFilter} onValueChange={(val) => setUsuarioFilter(val as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Usuário">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsuarios.map(u => (
                      <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>{u.id}</TableCell>
                        <TableCell>{u.nome}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'Admin' ? 'secondary' : 'default'}>{u.role}</Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="ghost" className="flex items-center gap-1"><Edit size={16} /> Editar</Button>
                          <Button size="sm" variant="destructive" className="flex items-center gap-1"><Trash size={16} /> Deletar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainAdmin>
  );
}
