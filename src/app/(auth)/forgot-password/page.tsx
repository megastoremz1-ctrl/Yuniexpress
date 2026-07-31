"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSent(true);
      }
    } catch {
      // Still show success to prevent enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
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
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email Enviado!</h1>
              <p className="text-sm text-gray-500 mb-2">
                Se o email <strong>{email}</strong> estiver registado, receberá um link para redefinir a password.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Verifique também a pasta de spam. O link expira em 1 hora.
              </p>
              <Link href="/login">
                <Button variant="outline" fullWidth>
                  <ArrowLeft size={16} className="mr-2" />
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-yellow-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Esqueceu a Password?</h1>
                <p className="text-sm text-gray-500 mt-2">
                  Introduza o seu email e enviaremos um link para criar uma nova password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="o-seu-email@exemplo.com"
                  icon={<Mail size={18} />}
                  required
                />

                <Button type="submit" fullWidth loading={loading} size="lg">
                  Enviar Link de Recuperação
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-yellow-600 inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Voltar ao Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
