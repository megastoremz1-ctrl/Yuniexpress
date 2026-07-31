"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Package, Mail, Lock, User, Phone, CheckSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As passwords não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Deve aceitar os Termos e Condições");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Conta criada! Verifique o seu email.");
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(data.error || "Erro ao criar conta");
      }
    } catch (error) {
      toast.error("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img
              src="/icons/icon-192x192.png"
              alt="YuniExpress"
              className="w-12 h-12 rounded-xl"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Criar Conta</h1>
          <p className="text-gray-500 mt-1">Junte-se ao YuniExpress</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border">
          <div className="space-y-4">
            <Input
              label="Nome completo"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="O seu nome"
              icon={<User size={18} />}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="o-seu-email@exemplo.com"
              icon={<Mail size={18} />}
              required
            />
            <Input
              label="Telemóvel"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+258 84 000 0000"
              icon={<Phone size={18} />}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              icon={<Lock size={18} />}
              required
            />
            <Input
              label="Confirmar Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repita a password"
              icon={<Lock size={18} />}
              required
            />
          </div>

          <Button type="submit" fullWidth loading={loading} className="mt-6" size="lg">
            Criar Conta
          </Button>

          <div className="mt-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-xs text-gray-500">
                Li e aceito os{" "}
                <Link href="/terms" className="text-yellow-600 hover:underline" target="_blank">
                  Termos e Condições
                </Link>{" "}
                e a{" "}
                <Link href="/privacy" className="text-yellow-600 hover:underline" target="_blank">
                  Política de Privacidade
                </Link>
              </span>
            </label>
          </div>
        </form>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-yellow-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
