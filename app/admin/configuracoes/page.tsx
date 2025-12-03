'use client';
import React, { useEffect, useState } from 'react';
import MainAdmin from '../../components/MainAdmin';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function AdminConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    siteName: 'FacturaJá',
    defaultCurrency: 'EUR',
    defaultLanguage: 'pt-PT',
    enableEmail: true,
    emailFrom: 'no-reply@facturaja.com',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    enableStripe: false,
    stripeKey: '',
    enableMulticaixa: true,
    multicaixaConfig: '',
    autoBackup: false,
    backupSchedule: 'daily', // daily | weekly | monthly
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500); // simula fetch
  }, []);

  const update = (key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    setSaving(true);
    setTimeout(() => {
      toast({ title: 'Configurações guardadas com sucesso!' });
      setSaving(false);
    }, 1000);
  };

  const backupNow = () => {
    toast({ title: 'Backup disparado com sucesso!' });
  };

  if (loading) return <MainAdmin><p className="p-6 text-center">Carregando configurações...</p></MainAdmin>;

  return (
    <MainAdmin>
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-[#123859]">Configurações do Sistema</h1>

        {/* Geral */}
        <Card>
          <CardHeader>
            <CardTitle>Geral</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nome da aplicação</Label>
              <Input value={config.siteName} onChange={e => update('siteName', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Moeda padrão</Label>
              <Input value={config.defaultCurrency} onChange={e => update('defaultCurrency', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Idioma</Label>
              <Select value={config.defaultLanguage} onValueChange={value => update('defaultLanguage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-PT">Português (PT)</SelectItem>
                  <SelectItem value="pt-AO">Português (AO)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Auto Backup</Label>
              <div className="flex items-center gap-4">
                <Switch checked={config.autoBackup} onCheckedChange={(checked) => update('autoBackup', checked)} />
                <Select value={config.backupSchedule} onValueChange={value => update('backupSchedule', value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={backupNow} variant="outline">Backup Agora</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email / SMTP */}
        <Card>
          <CardHeader>
            <CardTitle>Email / SMTP</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Habilitar envio de email</Label>
              <Switch checked={config.enableEmail} onCheckedChange={(checked) => update('enableEmail', checked)} />
            </div>
            <div className="space-y-1">
              <Label>Email do remetente</Label>
              <Input value={config.emailFrom} onChange={e => update('emailFrom', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>SMTP Host</Label>
              <Input value={config.smtpHost} onChange={e => update('smtpHost', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Porta</Label>
              <Input type="number" value={config.smtpPort} onChange={e => update('smtpPort', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label>SMTP User</Label>
              <Input value={config.smtpUser} onChange={e => update('smtpUser', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>SMTP Password</Label>
              <Input value={config.smtpPass} onChange={e => update('smtpPass', e.target.value)} type="password" />
            </div>
            <Button className="md:col-span-2" onClick={() => toast({ title: 'Email teste enviado!' })}>Enviar Email de Teste</Button>
          </CardContent>
        </Card>

        {/* Gateways de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Gateways de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Stripe</Label>
              <div className="flex items-center gap-2">
                <Switch checked={config.enableStripe} onCheckedChange={(checked) => update('enableStripe', checked)} />
                <Input placeholder="Stripe Key" value={config.stripeKey} onChange={e => update('stripeKey', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Multicaixa / Local</Label>
              <div className="flex items-center gap-2">
                <Switch checked={config.enableMulticaixa} onCheckedChange={(checked) => update('enableMulticaixa', checked)} />
                <Input placeholder="Config Multicaixa" value={config.multicaixaConfig} onChange={e => update('multicaixaConfig', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => toast({ title: 'Restaurado defaults!' })}>Restaurar Predefinidos</Button>
          <Button onClick={saveConfig}>{saving ? 'A gravar...' : 'Guardar Configurações'}</Button>
        </div>
      </div>
    </MainAdmin>
  );
}
