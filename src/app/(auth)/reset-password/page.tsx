"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setErrorMsg("A password deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As passwords não coincidem");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao redefinir password");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h1>
        <p className="text-sm text-gray-500 mb-6">
          Este link de recuperação é inválido ou expirou.
        </p>
        <Link href="/forgot-password">
          <Button fullWidth>Solicitar Novo Link</Button>
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Password Redefinida!</h1>
        <p className="text-sm text-gray-500 mb-6">
          A sua password foi alterada com sucesso. Pode fazer login com a nova password.
        </p>
        <Link href="/login">
          <Button fullWidth size="lg">Fazer Login</Button>
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Erro</h1>
        <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
        <div className="space-y-3">
          <Link href="/forgot-password">
            <Button fullWidth>Solicitar Novo Link</Button>
          </Link>
          <Link href="/login">
            <Button fullWidth variant="ghost">Voltar ao Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-yellow-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Nova Password</h1>
        <p className="text-sm text-gray-500 mt-2">
          Introduza a sua nova password abaixo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Nova Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            icon={<Lock size={18} />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Input
          label="Confirmar Password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita a nova password"
          icon={<Lock size={18} />}
          required
        />

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= level * 3
                      ? password.length >= 10
                        ? "bg-green-500"
                        : password.length >= 8
                        ? "bg-yellow-500"
                        : "bg-red-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              {password.length < 6
                ? "Muito curta"
                : password.length < 8
                ? "Aceitável"
                : password.length < 10
                ? "Boa"
                : "Forte"}
            </p>
          </div>
        )}

        {errorMsg && status === "form" && (
          <p className="text-sm text-red-500">{errorMsg}</p>
        )}

        <Button type="submit" fullWidth loading={loading} size="lg">
          Redefinir Password
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
              <div className="text-center py-8">
                <Loader2 size={32} className="text-yellow-500 animate-spin mx-auto" />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
