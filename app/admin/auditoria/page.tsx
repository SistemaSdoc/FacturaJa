'use client';
import React, { useEffect, useMemo, useState } from 'react';
import MainAdmin from '../../components/MainAdmin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'OTHER';

interface AuditLog {
  id: number;
  timestamp: string; // ISO
  user: string;
  company?: string;
  action: ActionType;
  object: string;
  description: string;
  ip?: string;
  meta?: Record<string, any>;
}

const ACTIONS: ActionType[] = ['CREATE','UPDATE','DELETE','LOGIN','LOGOUT','OTHER'];

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function generateMockLogs(count = 120): AuditLog[] {
  const users = ['admin', 'joao.silva', 'maria.santos', 'financeiro', 'suporte'];
  const companies = ['Empresa A', 'Empresa B', 'Empresa C', 'Empresa D'];
  const objs = ['Empresa','Fatura','Cliente','Produto','Configuração','Usuário'];
  const actions: ActionType[] = ['CREATE','UPDATE','DELETE','LOGIN','LOGOUT','OTHER'];

  const logs: AuditLog[] = [];
  for (let i = 0; i < count; i++) {
    const when = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 60); 
    const user = users[Math.floor(Math.random() * users.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const obj = objs[Math.floor(Math.random() * objs.length)];
    const id = Math.floor(Math.random() * 500) + 1;
    const action = actions[Math.floor(Math.random() * actions.length)];
    const ip = `102.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    logs.push({
      id: i + 1,
      timestamp: when.toISOString(),
      user,
      company,
      action,
      object: `${obj}:${id}`,
      description: `${action} realizado por ${user} sobre ${obj} #${id}`,
      ip,
      meta: { example: 'meta', changes: (action === 'UPDATE' ? { field: 'nif', before: '123', after: '456' } : undefined) }
    });
  }
  return logs.sort((a,b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export default function AdminAuditoriaPage() {
  const [allLogs] = useState<AuditLog[]>(() => generateMockLogs(200));
  const [query, setQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const users = useMemo(() => Array.from(new Set(allLogs.map(l => l.user))), [allLogs]);

  const filtered = useMemo(() => {
    return allLogs.filter(l => {
      if (query && !`${l.user} ${l.company ?? ''} ${l.action} ${l.object} ${l.description} ${l.ip}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (userFilter !== 'all' && l.user !== userFilter) return false;
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      if (startDate && new Date(l.timestamp) < new Date(startDate+'T00:00:00')) return false;
      if (endDate && new Date(l.timestamp) > new Date(endDate+'T23:59:59')) return false;
      return true;
    });
  }, [allLogs, query, userFilter, actionFilter, startDate, endDate]);

  useEffect(() => setPage(1), [query, userFilter, actionFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  const exportCSV = () => {
    const rows = filtered.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      user: r.user,
      company: r.company ?? '',
      action: r.action,
      object: r.object,
      description: r.description,
      ip: r.ip ?? ''
    }));
    const header = Object.keys(rows[0] ?? {}).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainAdmin>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#123859] mb-6">Auditoria / Logs do Sistema</h1>

        {/* Filtros */}
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Pesquisar livre</label>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="usuário, objeto, ip, descrição..." className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Usuário</label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {users.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Ação</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Data início</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Data fim</label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div className="flex gap-2 justify-end md:justify-start">
            <button onClick={()=>{ setQuery(''); setUserFilter('all'); setActionFilter('all'); setStartDate(''); setEndDate(''); }} className="px-3 py-2 border rounded">Limpar</button>
            <button onClick={exportCSV} className="px-3 py-2 bg-[#F9941F] text-white rounded">Exportar CSV</button>
          </div>
        </div>

        {/* Resumo */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="text-sm text-gray-600">Mostrando <strong>{filtered.length}</strong> registos — página {page} / {totalPages}</div>
          <div className="text-sm text-gray-500">Último registo: {allLogs[0] ? formatDateShort(allLogs[0].timestamp) : '—'}</div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#E5E5E5]">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Data / Hora</th>
                <th className="p-2 text-left">Usuário</th>
                <th className="p-2 text-left hidden md:table-cell">Empresa</th>
                <th className="p-2 text-left">Ação</th>
                <th className="p-2 text-left">Objeto</th>
                <th className="p-2 text-left">IP</th>
                <th className="p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(l => (
                <tr key={l.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{l.id}</td>
                  <td className="p-2">{formatDateShort(l.timestamp)}</td>
                  <td className="p-2 font-medium">{l.user}</td>
                  <td className="p-2 hidden md:table-cell">{l.company}</td>
                  <td className={`p-2 font-semibold ${l.action === 'DELETE' ? 'text-red-600' : l.action === 'CREATE' ? 'text-green-600' : 'text-[#123859]'}`}>{l.action}</td>
                  <td className="p-2">{l.object}</td>
                  <td className="p-2">{l.ip}</td>
                  <td className="p-2">
                    <button onClick={() => setDetail(l)} className="text-blue-500 hover:underline">Ver</button>
                  </td>
                </tr>
              ))}

              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">Nenhum log encontrado com esses filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4 gap-3">
          <div className="flex gap-2">
            <button onClick={()=>setPage(1)} disabled={page===1} className="px-3 py-1 border rounded disabled:opacity-50">« Primeiro</button>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 border rounded disabled:opacity-50">‹ Anterior</button>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Próximo ›</button>
            <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Último »</button>
          </div>

          <div className="text-sm text-gray-600">
            Ir para página:
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e)=>{ const v = Number(e.target.value) || 1; setPage(Math.min(Math.max(1, v), totalPages)); }}
              className="ml-2 w-16 border p-1 rounded"
            />
          </div>
        </div>
      </div>

      {/* Modal detalhe */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-40">
          <div className="bg-white rounded shadow w-full max-w-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#123859]">Log #{detail.id}</h3>
                <div className="text-sm text-gray-600"> {formatDateShort(detail.timestamp)} — {detail.user}</div>
              </div>
              <button onClick={()=>setDetail(null)} className="text-gray-500">Fechar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Ação</p>
                <div className="font-medium mb-2">{detail.action}</div>

                <p className="text-sm text-gray-600">Objeto</p>
                <div className="mb-2">{detail.object}</div>

                <p className="text-sm text-gray-600">Empresa</p>
                <div className="mb-2">{detail.company}</div>

                <p className="text-sm text-gray-600">IP</p>
                <div className="mb-2">{detail.ip}</div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Descrição</p>
                <div className="mb-2">{detail.description}</div>

                <p className="text-sm text-gray-600">Meta / Changes</p>
                <pre className="bg-[#F2F2F2] p-2 rounded text-xs overflow-auto max-h-48">{JSON.stringify(detail.meta ?? {}, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button onClick={()=>setDetail(null)} className="px-3 py-2 border rounded">Fechar</button>
              <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(detail)); alert('Detalhe copiado para o clipboard'); }} className="px-3 py-2 bg-[#123859] text-white rounded">Copiar JSON</button>
            </div>
          </div>
        </div>
      )}
    </MainAdmin>
  );
}
