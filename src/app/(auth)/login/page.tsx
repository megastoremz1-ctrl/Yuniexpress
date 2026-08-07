"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const [emailNotVerified, setEmailNotVerified] = useState(false);

  /**
   * Verifica se o NextAuth redirecionou
   * para esta página com algum erro.
   */
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const emailParam = searchParams.get("email");

    if (errorParam === "EMAIL_NOT_VERIFIED") {
      setEmailNotVerified(true);
      setError(
        "O seu email ainda não foi verificado. Verifique a sua caixa de entrada."
      );

      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [searchParams]);

  /**
   * Login com email e password
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

      setLoading(true);
  setError("");
  setEmailNotVerified(false);

  try {
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (!email.trim()) {
      setError("Digite o seu email.");
      return;
    }

    if (!password) {
      setError("Digite a sua password.");
      return;
    }


    if (!result) {
      setError("Não foi possível iniciar sessão.");
      return;
    }

    console.log(result);

    // Email não verificado
    if (
      result.error === "EMAIL_NOT_VERIFIED" ||
      result.error?.includes("EMAIL_NOT_VERIFIED")
    ) {
      router.push(
        `/verify-email?email=${encodeURIComponent(email.trim())}`
      );
      return;
    }

    // Credenciais inválidas
    if (result.error) {
      setError("Email ou password incorretos.");
      return;
    }

    // Login com sucesso
    router.push("/");
    router.refresh();
  } catch (error) {
    console.error(error);

    setError(
      "Ocorreu um erro ao iniciar sessão. Tente novamente."
    );
  } finally {
    setLoading(false);
  }
}
  /**
   * Login com Google
   */
  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        "Não foi possível entrar com Google. Tente novamente."
      );

      setGoogleLoading(false);
    }
  }

  /**
   * Ir para verificação de email
   */
  function goToVerification() {
    const emailValue = email.trim();

    if (emailValue) {
      router.push(
        `/verify-email?email=${encodeURIComponent(emailValue)}`
      );
    } else {
      router.push("/verify-email");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* CARD */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-sm p-8">

          {/* LOGO */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-xl bg-yellow-500 flex items-center justify-center shadow-sm">
              <div className="text-white text-2xl font-black">
                Y
              </div>
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold text-black">
              Bem-vindo de volta
            </h1>

            <p className="text-gray-500 mt-2">
              Entre na sua conta YuniExpress
            </p>
          </div>

          {/* ERRO */}
          {error && (
            <div
              className={`mb-5 rounded-lg border p-4 ${
                emailNotVerified
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className={
                    emailNotVerified
                      ? "text-yellow-600 mt-0.5"
                      : "text-red-500 mt-0.5"
                  }
                />

                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      emailNotVerified
                        ? "text-yellow-800"
                        : "text-red-700"
                    }`}
                  >
                    {error}
                  </p>

                  {emailNotVerified && (
                    <button
                      type="button"
                      onClick={goToVerification}
                      className="mt-2 text-sm font-semibold text-yellow-700 underline hover:text-yellow-800"
                    >
                      Verificar o meu email
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setEmailNotVerified(false);
                  }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={loading || googleLoading}
                  className="
                    w-full
                    h-12
                    pl-11
                    pr-4
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    text-gray-900
                    outline-none
                    transition
                    focus:border-yellow-500
                    focus:ring-2
                    focus:ring-yellow-100
                    disabled:bg-gray-100
                    disabled:cursor-not-allowed
                  "
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Esqueceu a password?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                    setEmailNotVerified(false);
                  }}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  disabled={loading || googleLoading}
                  className="
                    w-full
                    h-12
                    pl-11
                    pr-12
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    text-gray-900
                    outline-none
                    transition
                    focus:border-yellow-500
                    focus:ring-2
                    focus:ring-yellow-100
                    disabled:bg-gray-100
                    disabled:cursor-not-allowed
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  disabled={loading || googleLoading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-gray-600
                  "
                  aria-label={
                    showPassword
                      ? "Esconder password"
                      : "Mostrar password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* BOTÃO LOGIN */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="
                w-full
                h-12
                rounded-lg
                bg-yellow-500
                hover:bg-yellow-600
                text-black
                font-semibold
                transition
                flex
                items-center
                justify-center
                gap-2
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* SEPARADOR */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-300 flex-1" />

            <span className="text-sm text-gray-500">
              ou
            </span>

            <div className="h-px bg-gray-300 flex-1" />
          </div>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="
              w-full
              h-12
              rounded-lg
              border-2
              border-gray-900
              bg-white
              text-gray-900
              font-medium
              flex
              items-center
              justify-center
              gap-3
              transition
              hover:bg-gray-50
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {googleLoading ? (
              <Loader2
                size={20}
                className="animate-spin"
              />
            ) : (
              <GoogleIcon />
            )}

            {googleLoading
              ? "A entrar com Google..."
              : "Continuar com Google"}
          </button>

          {/* VOLTAR */}
          <div className="mt-6">
            <Link
              href="/"
              className="
                flex
                items-center
                justify-center
                gap-2
                text-sm
                text-gray-500
                hover:text-gray-700
              "
            >
              <ArrowLeft size={16} />

              Voltar para a loja
            </Link>
          </div>
        </div>

        {/* REGISTRO */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-yellow-600 font-semibold hover:text-yellow-700"
            >
              Registar-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * ÍCONE OFICIAL DO GOOGLE
 *
 * Não depende de react-icons.
 * Não precisa instalar nenhum pacote.
 */
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      />

      <path
        fill="#34A853"
        d="M12 21.99c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.99Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 14.07A5.86 5.86 0 0 1 6.23 12c0-.72.12-1.42.31-2.07V7.4H3.3A9.98 9.98 0 0 0 2.25 12c0 1.66.4 3.23 1.05 4.6l3.24-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.9c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 2.98 14.63 2 12 2a9.74 9.74 0 0 0-8.7 5.4l3.24 2.53C7.31 7.62 9.46 5.9 12 5.9Z"
      />
    </svg>
  );
}
