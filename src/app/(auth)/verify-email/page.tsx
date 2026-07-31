"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"pending" | "verifying" | "success" | "error">(
    token ? "verifying" : "pending"
  );
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Verify token when present
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (t: string) => {
    setStatus("verifying");
    try {
      const res = await fetch(`/api/auth/verify-email?token=${t}`);
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Email verificado com sucesso!");
      } else {
        setStatus("error");
        setMessage(data.error || "Erro ao verificar email");
      }
    } catch {
      setStatus("error");
      setMessage("Erro de conexão. Tente novamente.");
    }
  };

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setResent(false);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResent(true);
      }
    } catch {
      // silent fail
    } finally {
      setResending(false);
    }
  };

  // Verifying state
  if (status === "verifying") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 size={32} className="text-yellow-500 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">A verificar...</h1>
        <p className="text-gray-500">Estamos a confirmar o seu email. Um momento...</p>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verificado!</h1>
        <p className="text-gray-500 mb-8">{message}</p>
        <Link href="/login">
          <Button size="lg" fullWidth>
            Fazer Login
          </Button>
        </Link>
      </div>
    );
  }

  // Error state (from token verification)
  if (status === "error") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificação Falhou</h1>
        <p className="text-gray-500 mb-8">{message}</p>
        <div className="space-y-3">
          <Link href="/register">
            <Button size="lg" fullWidth variant="outline">
              Criar Nova Conta
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" fullWidth variant="ghost">
              Voltar ao Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Pending state (just registered, check inbox)
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail size={32} className="text-yellow-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifique o seu Email</h1>
      <p className="text-gray-500 mb-2">
        Enviámos um link de verificação para:
      </p>
      {email && (
        <p className="font-semibold text-gray-900 mb-6">{email}</p>
      )}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-800">
          Clique no link no email para activar a sua conta. Verifique também a pasta de spam.
        </p>
      </div>

      {/* Resend button */}
      <div className="mb-6">
        {resent ? (
          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
            <CheckCircle size={14} />
            Email reenviado com sucesso!
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
          >
            {resending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Reenviar email de verificação
          </button>
        )}
      </div>

      <Link href="/login">
        <Button size="lg" fullWidth variant="outline">
          Já verifiquei, ir para Login
        </Button>
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <Suspense
            fallback={
              <div className="text-center">
                <Loader2 size={32} className="text-yellow-500 animate-spin mx-auto" />
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
