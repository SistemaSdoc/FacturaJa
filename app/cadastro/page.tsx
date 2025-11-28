"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

export default function CadastroPage() {
  const [step, setStep] = useState(1);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const [company, setCompany] = useState({
    companyName: "",
    nif: "",
    email: "",
    phone: "",
    address: "",
    paymentMethods: { bankTransfer: true, card: true, multicaixa: true },
    logoFile: null,
    logoPreview: null,
  });

  const logoInputRef = useRef(null);

  const [users, setUsers] = useState([
    { id: 1, name: "", email: "", role: "Admin", avatarFile: null, avatarPreview: null },
  ]);

  const avatarInputRefs = useRef({});
  const companyLogoPreviewRef = useRef(null);
  const avatarPreviewsRef = useRef({});
  const nextUserId = useRef(2);

  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isNIF = (v) => /^\d{9,14}$/.test(v);
  const isPhone = (v) => /^[+0-9()\-\s]{6,20}$/.test(v);

  useEffect(() => {
    return () => {
      if (companyLogoPreviewRef.current) {
        try { URL.revokeObjectURL(companyLogoPreviewRef.current); } catch {}
        companyLogoPreviewRef.current = null;
      }
      Object.values(avatarPreviewsRef.current).forEach((p) => {
        if (p) try { URL.revokeObjectURL(p); } catch {}
      });
      avatarPreviewsRef.current = {};
    };
  }, []);

  function setError(key, msg) { setErrors((e) => ({ ...e, [key]: msg })); }
  function clearError(key) { setErrors((e) => { const c = { ...e }; delete c[key]; return c; }); }

  function handleLogoUpload(file) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError('logo', `Ficheiro demasiado grande. Máx ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`);
      return;
    }
    clearError('logo');
    if (companyLogoPreviewRef.current) try { URL.revokeObjectURL(companyLogoPreviewRef.current); } catch {}
    const preview = URL.createObjectURL(file);
    companyLogoPreviewRef.current = preview;
    setCompany((c) => ({ ...c, logoFile: file, logoPreview: preview }));
  }

  function removeLogo() {
    if (companyLogoPreviewRef.current) try { URL.revokeObjectURL(companyLogoPreviewRef.current); } catch {}
    companyLogoPreviewRef.current = null;
    setCompany((c) => ({ ...c, logoFile: null, logoPreview: null }));
    clearError('logo');
    if (logoInputRef.current) logoInputRef.current.value = null;
  }

  function handleAvatarUpload(id, file) {
    setUsers((list) => list.map((u) => {
      if (u.id !== id) return u;
      if (!file) {
        if (avatarPreviewsRef.current[id]) try { URL.revokeObjectURL(avatarPreviewsRef.current[id]); } catch {}
        delete avatarPreviewsRef.current[id];
        return { ...u, avatarFile: null, avatarPreview: null };
      }
      if (file.size > MAX_FILE_SIZE) { setError(`avatar_${id}`, `Ficheiro demasiado grande. Máx 5MB.`); return u; }
      clearError(`avatar_${id}`);
      if (avatarPreviewsRef.current[id]) try { URL.revokeObjectURL(avatarPreviewsRef.current[id]); } catch {}
      const preview = URL.createObjectURL(file);
      avatarPreviewsRef.current[id] = preview;
      return { ...u, avatarFile: file, avatarPreview: preview };
    }));
  }

  function removeAvatar(id) {
    setUsers((list) => list.map((u) => {
      if (u.id !== id) return u;
      if (avatarPreviewsRef.current[id]) try { URL.revokeObjectURL(avatarPreviewsRef.current[id]); } catch {}
      delete avatarPreviewsRef.current[id];
      if (avatarInputRefs.current[id]) avatarInputRefs.current[id].value = null;
      clearError(`avatar_${id}`);
      return { ...u, avatarFile: null, avatarPreview: null };
    }));
  }

  function validateStep1() {
    const e = {};
    if (!company.companyName.trim()) e.companyName = "Nome da empresa é obrigatório.";
    if (!company.nif.trim()) e.nif = "NIF é obrigatório.";
    if (!company.email.trim()) e.email = "Email é obrigatório.";
    else if (!isEmail(company.email.trim())) e.email = "Email inválido.";
    if (company.phone && !isPhone(company.phone)) e.phone = "Telefone inválido.";
    setErrors((old) => ({ ...old, ...e }));
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
    users.forEach((u, idx) => {
      if (!u.name || !u.name.trim()) e[`user_name_${idx}`] = `Nome do usuário #${idx + 1} é obrigatório.`;
      if (!u.email || !isEmail(u.email)) e[`user_email_${idx}`] = `Email do usuário #${idx + 1} é inválido.`;
    });
    setErrors((old) => ({ ...old, ...e }));
    return Object.keys(e).length === 0;
  }

  function validateStep3() {
    const e = {};
    if (!acceptsTerms) e.terms = "Aceite os termos para continuar.";
    if (!company.paymentMethods.bankTransfer && !company.paymentMethods.card && !company.paymentMethods.multicaixa)
      e.payments = "Selecione pelo menos um método de pagamento.";
    setErrors((old) => ({ ...old, ...e }));
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => Math.min(3, s + 1));
  }

  function back() { setStep((s) => Math.max(1, s - 1)); }
  function updateCompany(field, value) { setCompany((c) => ({ ...c, [field]: value })); }
  function togglePayment(key) { setCompany((c) => ({ ...c, paymentMethods: { ...c.paymentMethods, [key]: !c.paymentMethods[key] } })); }
  function addUser() { const id = nextUserId.current++; setUsers((u) => [...u, { id, name: "", email: "", role: "Financeiro", avatarFile: null, avatarPreview: null }]); }
  function removeUser(id) {
    setUsers((u) => {
      const toRemove = u.find((x) => x.id === id);
      if (toRemove?.avatarPreview && avatarPreviewsRef.current[id]) {
        try { URL.revokeObjectURL(avatarPreviewsRef.current[id]); } catch {}
        delete avatarPreviewsRef.current[id];
      }
      if (avatarInputRefs.current[id]) avatarInputRefs.current[id].value = null;
      setErrors((old) => { const c = { ...old }; delete c[`avatar_${id}`]; return c; });
      return u.filter((x) => x.id !== id);
    });
  }
  function updateUser(id, field, value) { setUsers((u) => u.map((x) => (x.id === id ? { ...x, [field]: value } : x))); }

  async function submit() {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return setStep(1);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("companyName", company.companyName);
      formData.append("nif", company.nif);
      formData.append("email", company.email);
      formData.append("phone", company.phone || "");
      formData.append("address", company.address || "");
      if (company.logoFile) formData.append("logo", company.logoFile);
      Object.entries(company.paymentMethods).forEach(([k,v]) => formData.append(`paymentMethods[${k}]`, v?"1":"0"));
      users.forEach((u, idx) => {
        formData.append(`users[${idx}][name]`, u.name);
        formData.append(`users[${idx}][email]`, u.email);
        formData.append(`users[${idx}][role]`, u.role);
        if (u.avatarFile) formData.append(`users[${idx}][avatar]`, u.avatarFile);
      });
      formData.append("acceptsTerms", acceptsTerms?"1":"0");

      const res = await fetch("/api/auth/cadastro", { method:"POST", body:formData });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Erro ao registar"); setSubmitting(false); return; }

      try { localStorage.setItem("token", data.token); localStorage.setItem("role", data.role); } catch {}
      alert("Cadastro feito com sucesso! Redirecionando...");
      setTimeout(()=>window.location.href="/dashboard", 2000);
    } catch(e) { console.error(e); alert("Erro de servidor, tente novamente."); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen font-sans bg-[#F2F2F2] px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#123859] mb-6 text-center">Cadastro de Empresa — FacturaJá</h1>

        {/* Step indicators */}
        <div className="flex justify-between mb-8">
          {[1,2,3].map((s)=>(
            <div key={s} className="flex-1">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 text-white font-bold
                ${step===s?'bg-[#F9941F]':step>s?'bg-gray-300':'bg-green-500'}`}>
                <span suppressHydrationWarning>{step>s?'✓':s}</span>
              </div>
              <div className="text-xs text-center">{s===1?'Empresa':s===2?'Usuários':'Resumo'}</div>
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step===1 && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold">Nome da Empresa</label>
              <input type="text" value={company.companyName} onChange={e=>updateCompany("companyName",e.target.value)} className="w-full border p-2 rounded"/>
              {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
            </div>
            <div>
              <label className="block font-semibold">NIF</label>
              <input type="text" value={company.nif} onChange={e=>updateCompany("nif",e.target.value)} className="w-full border p-2 rounded"/>
              {errors.nif && <p className="text-red-500 text-sm">{errors.nif}</p>}
            </div>
            <div>
              <label className="block font-semibold">Email</label>
              <input type="email" value={company.email} onChange={e=>updateCompany("email",e.target.value)} className="w-full border p-2 rounded"/>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label className="block font-semibold">Telefone</label>
              <input type="text" value={company.phone} onChange={e=>updateCompany("phone",e.target.value)} className="w-full border p-2 rounded"/>
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <div>
              <label className="block font-semibold">Endereço</label>
              <input type="text" value={company.address} onChange={e=>updateCompany("address",e.target.value)} className="w-full border p-2 rounded"/>
            </div>
            <div>
              <label className="block font-semibold">Logo da Empresa</label>
              {company.logoPreview && <img src={company.logoPreview} className="w-24 h-24 object-cover mb-2 rounded" alt="logo preview"/>}
              <input type="file" ref={logoInputRef} onChange={e=>handleLogoUpload(e.target.files?.[0])}/>
              {company.logoPreview && <button type="button" onClick={removeLogo} className="text-red-500 mt-1">Remover</button>}
              {errors.logo && <p className="text-red-500 text-sm">{errors.logo}</p>}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step===2 && (
          <div className="space-y-6">
            {users.map((u,idx)=>(
              <div key={u.id} className="border p-4 rounded relative">
                <h3 className="font-semibold mb-2">Usuário #{idx+1}</h3>
                <div className="mb-2">
                  <label className="block font-semibold">Nome</label>
                  <input type="text" value={u.name} onChange={e=>updateUser(u.id,"name",e.target.value)} className="w-full border p-2 rounded"/>
                  {errors[`user_name_${idx}`] && <p className="text-red-500 text-sm">{errors[`user_name_${idx}`]}</p>}
                </div>
                <div className="mb-2">
                  <label className="block font-semibold">Email</label>
                  <input type="email" value={u.email} onChange={e=>updateUser(u.id,"email",e.target.value)} className="w-full border p-2 rounded"/>
                  {errors[`user_email_${idx}`] && <p className="text-red-500 text-sm">{errors[`user_email_${idx}`]}</p>}
                </div>
                <div>
                  <label className="block font-semibold">Foto perfil</label>
                  {u.avatarPreview && <img src={u.avatarPreview} className="w-16 h-16 object-cover mb-2 rounded-full" alt={`avatar ${idx+1}`}/>}
                  <input type="file" ref={el=>avatarInputRefs.current[u.id]=el} onChange={e=>handleAvatarUpload(u.id,e.target.files?.[0])}/>
                  {u.avatarPreview && <button type="button" onClick={()=>removeAvatar(u.id)} className="text-red-500 mt-1">Remover</button>}
                  {errors[`avatar_${u.id}`] && <p className="text-red-500 text-sm">{errors[`avatar_${u.id}`]}</p>}
                </div>
                {users.length>1 && <button type="button" onClick={()=>removeUser(u.id)} className="absolute top-2 right-2 text-red-500 font-bold">×</button>}
              </div>
            ))}
            <button type="button" onClick={addUser} className="bg-[#F9941F] text-white px-4 py-2 rounded">Adicionar Usuário</button>
          </div>
        )}

        {/* Step 3 */}
        {step===3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg mb-2">Resumo do Cadastro</h2>
            <div className="p-4 border rounded bg-[#F2F2F2] space-y-2">
              <p><strong>Empresa:</strong> {company.companyName}</p>
              <p><strong>NIF:</strong> {company.nif}</p>
              <p><strong>Email:</strong> {company.email}</p>
              <p><strong>Telefone:</strong> {company.phone}</p>
              <p><strong>Endereço:</strong> {company.address}</p>
              <p><strong>Métodos de pagamento:</strong> {Object.entries(company.paymentMethods).filter(([k,v])=>v).map(([k])=>k).join(", ")}</p>
              <p><strong>Usuários:</strong> {users.map(u=>u.name).join(", ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={acceptsTerms} onChange={(e)=>setAcceptsTerms(e.target.checked)}/>
              <label>Aceito os termos de uso</label>
            </div>
            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
            {errors.payments && <p className="text-red-500 text-sm">{errors.payments}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step>1 ? <button onClick={back} className="px-4 py-2 bg-gray-300 rounded">Voltar</button> : <div></div>}
          {step<3 ? <button onClick={next} className="px-4 py-2 bg-[#123859] text-white rounded">Próximo</button> : <button onClick={submit} disabled={submitting} className="px-4 py-2 bg-[#F9941F] text-white rounded">{submitting ? 'Enviando...' : 'Finalizar Cadastro'}</button>}
        </div>
      </div>
    </div>
  );
}
