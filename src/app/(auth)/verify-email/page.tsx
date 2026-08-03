"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam ?? "");

  const [status, setStatus] = useState<
    "loading" | "waiting" | "success" | "error"
  >(token ? "loading" : "waiting");

  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [sent, setSent] = useState(false);

  const [timer, setTimer] = useState(0);

  // ------------------------
  // Verificar Token
  // ------------------------
  const verifyToken = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${encodeURIComponent(token)}`
      );

      let data = {};

      try {
        data = await response.json();
      } catch {}

      if (response.ok) {
        setStatus("success");
        setMessage(
          (data as any).message ?? "Email verificado com sucesso."
        );
      } else {
        setStatus("error");
        setMessage(
          (data as any).error ?? "Token inválido ou expirado."
        );
      }
    } catch {
      setStatus("error");
      setMessage("Erro de conexão.");
    }
  }, [token]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // ------------------------
  // Timer
  // ------------------------
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ------------------------
  // Reenviar Email
  // ------------------------
  async function resend() {
    if (!email.trim()) {
      setMessage("Informe um email.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setMessage("Email inválido.");
      return;
    }

    if (sending || timer > 0) return;

    try {
      setSending(true);
      setSent(false);
      setMessage("");

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {}

      if (response.ok) {
        setSent(true);
        setTimer(60);
      } else {
        setMessage(
          (data as any).error ?? "Erro ao reenviar email."
        );
      }
    } catch {
      setMessage("Erro ao reenviar email.");
    } finally {
      setSending(false);
    }
  }

  // ------------------------
  // Loading
  // ------------------------
  if (status === "loading") {
    return (
      <div className="text-center">
        <Loader2
          className="mx-auto animate-spin text-yellow-500"
          size={45}
        />

        <h1 className="text-xl font-bold mt-5">
          A verificar email...
        </h1>
      </div>
    );
  }

  // ------------------------
  // Sucesso
  // ------------------------
  if (status === "success") {
    return (
      <div className="text-center">
        <CheckCircle
          size={55}
          className="mx-auto text-green-500"
        />

        <h1 className="text-2xl font-bold mt-5">
          Email confirmado
        </h1>

        <p className="text-gray-600 mt-3 mb-6">
          {message}
        </p>

        <Link
          href="/login"
          className="block w-full rounded-lg bg-yellow-500 py-3 text-white"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  // ------------------------
  // Erro
  // ------------------------
  if (status === "error") {
    return (
      <div className="text-center">
        <XCircle
          size={55}
          className="mx-auto text-red-500"
        />

        <h1 className="text-2xl font-bold mt-5">
          Erro na verificação
        </h1>

        <p className="text-gray-600 mt-3 mb-6">
          {message}
        </p>

        <Link
          href="/login"
          className="block rounded-lg border py-3"
        >
          Voltar ao Login
        </Link>
      </div>
    );
  }

  // ------------------------
  // Esperando confirmação
  // ------------------------
  return (
    <div className="text-center">
      <Mail
        size={55}
        className="mx-auto text-yellow-500"
      />

      <h1 className="mt-5 text-2xl font-bold">
        Verifique o seu email
      </h1>

      <p className="mt-3 text-gray-500">
        Enviamos um link de confirmação para o seu email.
      </p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu email"
        className="mt-5 w-full rounded-lg border px-4 py-3"
      />

      {message && (
        <p
          className={`mt-4 text-sm ${
            sent ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      {sent && (
        <p className="mt-2 text-sm text-green-600">
          Email reenviado com sucesso.
        </p>
      )}

      <button
        onClick={resend}
        disabled={sending || timer > 0}
        className="mx-auto mt-5 flex items-center justify-center gap-2 text-yellow-600 disabled:opacity-50"
      >
        {sending ? (
          <Loader2
            size={16}
            className="animate-spin"
          />
        ) : (
          <RefreshCw size={16} />
        )}

        {timer > 0 ? `Aguarde ${timer}s` : "Reenviar email"}
      </button>

      <Link
        href="/login"
        className="mt-6 block rounded-lg border py-3"
      >
        Já confirmei - Login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <Suspense
          fallback={
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-yellow-500"
                size={35}
              />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}
