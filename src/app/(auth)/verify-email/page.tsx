"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import Button from "@/components/ui/Button";


function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<
    "pending" | "verifying" | "success" | "error"
  >(token ? "verifying" : "pending");

  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);


  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);


  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setTimeout(() => {
      setCooldown((old) => old - 1);
    }, 1000);

    return () => clearTimeout(timer);

  }, [cooldown]);


  async function verifyEmail(tokenValue: string) {

    try {

      const response = await fetch(
        `/api/auth/verify-email?token=${tokenValue}`
      );

      const data = await response.json();


      if (response.ok) {

        setStatus("success");

        setMessage(
          data.message ||
          "Email verificado com sucesso!"
        );

      } else {

        setStatus("error");

        setMessage(
          data.error ||
          "Token inválido ou expirado."
        );

      }


    } catch {

      setStatus("error");

      setMessage(
        "Erro de conexão. Tente novamente."
      );

    }
  }



  async function resendEmail() {

    if (!email || resending || cooldown > 0) {
      return;
    }


    setResending(true);
    setResent(false);


    try {

      const response = await fetch(
        "/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );


      const data = await response.json();


      if (response.ok) {

        setResent(true);
        setCooldown(60);

      } else {

        setMessage(
          data.error ||
          "Não foi possível reenviar."
        );

      }


    } catch {

      setMessage(
        "Erro ao reenviar email."
      );

    } finally {

      setResending(false);

    }

  }



  if (status === "verifying") {

    return (
      <div className="text-center">

        <Loader2
          size={48}
          className="mx-auto mb-5 animate-spin text-yellow-500"
        />

        <h1 className="text-2xl font-bold">
          A verificar email...
        </h1>

        <p className="text-gray-500 mt-2">
          Aguarde enquanto confirmamos a sua conta.
        </p>

      </div>
    );

  }



  if (status === "success") {

    return (
      <div className="text-center">

        <CheckCircle
          size={55}
          className="mx-auto mb-5 text-green-500"
        />

        <h1 className="text-2xl font-bold">
          Email confirmado!
        </h1>

        <p className="text-gray-600 mt-3 mb-8">
          {message}
        </p>


        <Link href="/login">

          <Button
            fullWidth
            size="lg"
          >
            Fazer Login
          </Button>

        </Link>

      </div>
    );

  }



  if (status === "error") {

    return (
      <div className="text-center">

        <XCircle
          size={55}
          className="mx-auto mb-5 text-red-500"
        />

        <h1 className="text-2xl font-bold">
          Verificação falhou
        </h1>

        <p className="text-gray-600 mt-3 mb-8">
          {message}
        </p>


        <Link href="/login">

          <Button
            fullWidth
          >
            Voltar ao Login
          </Button>

        </Link>

      </div>
    );

  }



  return (
    <div className="text-center">

      <Mail
        size={55}
        className="mx-auto mb-5 text-yellow-500"
      />


      <h1 className="text-2xl font-bold">
        Verifique o seu email
      </h1>


      <p className="text-gray-500 mt-3">
        Enviamos um link de confirmação para:
      </p>


      {email && (
        <p className="font-semibold mt-2 mb-6">
          {email}
        </p>
      )}



      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">

        <p className="text-sm text-yellow-800">
          Clique no link recebido no email.
          Verifique também a pasta Spam.
        </p>

      </div>



      {resent && (
        <p className="text-green-600 text-sm mb-4">
          Email reenviado com sucesso!
        </p>
      )}



      <button
        onClick={resendEmail}
        disabled={resending || cooldown > 0}
        className="text-yellow-600 font-medium flex items-center justify-center gap-2 mx-auto"
      >

        {resending ? (
          <Loader2
            size={16}
            className="animate-spin"
          />
        ) : (
          <RefreshCw size={16}/>
        )}


        {cooldown > 0
          ? `Aguarde ${cooldown}s`
          : "Reenviar email de verificação"
        }

      </button>



      <Link href="/login">

        <Button
          variant="outline"
          fullWidth
          className="mt-6"
        >
          Já verifiquei - Login
        </Button>

      </Link>


    </div>
  );
}



export default function VerifyEmailPage() {

  return (

    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-8">


        <Suspense
          fallback={
            <div className="text-center">

              <Loader2
                size={35}
                className="animate-spin mx-auto text-yellow-500"
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
