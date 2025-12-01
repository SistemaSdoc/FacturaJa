"use client";

import React from "react";
import MainLayout from "../../../components/MainLayout";
import { useRouter } from "next/navigation";

export default function CriarClientePage(): JSX.Element {
    return (
        <MainLayout>
            <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-6">
                <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 border border-[#E5E5E5]">
                    <h1 className="text-2xl font-bold text-[#123859] mb-6 text-center">
                        Criar Novo Cliente
                    </h1>

                    <ClienteForm />
                </div>
            </div>
        </MainLayout>
    );
}

function ClienteForm(): JSX.Element {
    const router = useRouter(); // Inicializa o router

    const [nome, setNome] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [telefone, setTelefone] = React.useState<string>("");
    const [endereco, setEndereco] = React.useState<string>("");

    const [fotoFile, setFotoFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setFotoFile(file);
        setPreview(URL.createObjectURL(file));
    }

    function triggerFile() {
        fileInputRef.current?.click();
    }

    function removeImage() {
        setFotoFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log({ nome, email, telefone, endereco, fotoFile });
        alert("Cliente salvo (simulação)");

        // Redireciona após salvar
        router.push("/dashboard/clientes");
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Botão Voltar */}
            <button
                type="button"
                onClick={() => router.push("/dashboard/clientes")}
                className="px-4 py-2 rounded-xl border font-semibold text-[#F9941F] hover:bg-[#FFF4E6]"
            >
                Voltar
            </button>

            {/* Nome */}
            <div>
                <label className="block text-sm font-semibold text-[#123859] mb-1">
                    Nome do Cliente
                </label>
                <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    type="text"
                    className="w-full p-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#123859]"
                    placeholder="Digite o nome completo"
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-semibold text-[#123859] mb-1">
                    Email
                </label>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full p-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#123859]"
                    placeholder="exemplo@email.com"
                />
            </div>

            {/* Telefone */}
            <div>
                <label className="block text-sm font-semibold text-[#123859] mb-1">
                    Número de Telefone
                </label>
                <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    type="tel"
                    className="w-full p-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#123859]"
                    placeholder="Digite o número"
                />
            </div>

            {/* Endereço */}
            <div>
                <label className="block text-sm font-semibold text-[#123859] mb-1">
                    Endereço
                </label>
                <input
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    type="text"
                    className="w-full p-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#123859]"
                    placeholder="Rua, Bairro, Cidade"
                />
            </div>

            {/* Foto do Cliente */}
            <div>
                <label className="block text-sm font-semibold text-[#123859] mb-2">
                    Foto do Cliente
                </label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {preview ? (
                    <div className="flex items-center gap-4">
                        <img
                            src={preview}
                            alt="Pré-visualização"
                            className="w-24 h-24 object-cover rounded-xl border border-[#E5E5E5]"
                        />
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={triggerFile}
                                className="px-4 py-2 rounded-xl border font-semibold text-[#123859] hover:bg-[#F2F2F2]"
                            >
                                Mudar
                            </button>
                            <button
                                type="button"
                                onClick={removeImage}
                                className="px-4 py-2 rounded-xl border font-semibold text-[#F9941F] hover:bg-[#FFF4E6]"
                            >
                                Eliminar
                            </button>
                            <p className="text-xs text-gray-500">Tamanho máximo: 2 MB</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button
                            type="button"
                            onClick={triggerFile}
                            className="px-4 py-2 rounded-xl bg-[#F9941F] text-white font-semibold"
                        >
                            Adicionar Imagem
                        </button>
                        <p className="text-sm text-gray-500">
                            A imagem deve pesar no máximo 2 MB.
                        </p>
                    </div>
                )}
            </div>

            {/* Botão Salvar */}
            <button
                type="submit"
                className="w-full bg-[#123859] hover:bg-[#0f2d46] text-white font-semibold py-3 rounded-xl transition"
            >
                Salvar Cliente
            </button>
        </form>
    );
}
