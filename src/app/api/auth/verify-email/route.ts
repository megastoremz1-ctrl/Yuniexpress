"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import Button from "@/components/ui/Button";


function VerifyEmailContent() {

  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");


  const [status, setStatus] = useState<
    "pending" | "verifying" | "success" | "error"
  >(
    token ? "verifying" : "pending"
  );


  const [message, setMessage] = useState("");

  const [resending, setResending] = useState(false);

  const [resent, setResent] = useState(false);

  const [cooldown, setCooldown] = useState(0);



  // contador anti spam

  useEffect(() => {

    if (cooldown <= 0) return;


    const timer = setInterval(() => {

      setCooldown(value => value - 1);

    }, 1000);


    return () => clearInterval(timer);


  }, [cooldown]);





  // verificar token automaticamente

  useEffect(() => {

    if (token) {

      verifyToken(token);

    }

  }, [token]);






  async function verifyToken(tokenValue:string) {


    try {


      const response =
        await fetch(
          `/api/auth/verify-email?token=${tokenValue}`
        );


      const data =
        await response.json();



      if(response.ok){

        setStatus("success");

        setMessage(
          data.message ||
          "Email verificado com sucesso!"
        );


      }else{


        setStatus("error");

        setMessage(
          data.error ||
          "Erro ao verificar email."
        );

      }



    } catch {


      setStatus("error");

      setMessage(
        "Erro de conexão."
      );


    }


  }







  async function handleResend(){


    if(
      !email ||
      resending ||
      cooldown > 0
    )
      return;



    setResending(true);

    setResent(false);



    try {


      const response =
        await fetch(
          "/api/auth/verify-email",
          {

            method:"POST",

            headers:{
              "Content-Type":
              "application/json"
            },

            body:JSON.stringify({
              email
            })

          }
        );



      const data =
        await response.json();



      if(response.ok){

        setResent(true);

        setCooldown(60);


      }else{


        setMessage(
          data.error ||
          "Erro ao reenviar email."
        );


      }



    }catch{


      setMessage(
        "Erro ao reenviar email."
      );


    }finally{


      setResending(false);


    }


  }







  if(status === "verifying"){


    return (

      <div className="text-center">


        <Loader2
          size={40}
          className="
            mx-auto
            text-yellow-500
            animate-spin
            mb-5
          "
        />


        <h1 className="text-2xl font-bold">
          A verificar...
        </h1>


        <p className="text-gray-500 mt-2">
          Estamos a confirmar o seu email.
        </p>


      </div>

    );


  }







  if(status === "success"){


    return (

      <div className="text-center">


        <CheckCircle
          size={55}
          className="
            mx-auto
            text-green-500
            mb-5
          "
        />


        <h1 className="text-2xl font-bold">
          Email confirmado!
        </h1>


        <p className="text-gray-500 mt-3 mb-8">
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








  if(status === "error"){


    return (

      <div className="text-center">


        <XCircle
          size={55}
          className="
            mx-auto
            text-red-500
            mb-5
          "
        />


        <h1 className="text-2xl font-bold">
          Verificação falhou
        </h1>



        <p className="text-gray-500 mt-3 mb-8">
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
        className="
          mx-auto
          text-yellow-500
          mb-5
        "
      />



      <h1 className="text-2xl font-bold">
        Verifique o seu email
      </h1>



      <p className="text-gray-500 mt-3">
        Enviámos um link de confirmação para:
      </p>



      {
        email && (

          <p className="
            font-semibold
            mt-2
            mb-6
          ">
            {email}
          </p>

        )
      }





      <div className="
        bg-yellow-50
        border
        border-yellow-200
        rounded-xl
        p-4
        mb-6
      ">

        <p className="text-sm text-yellow-800">

          Clique no link recebido.
          Verifique também a pasta Spam.

        </p>


      </div>





      <a
        href="https://mail.google.com"
        target="_blank"
        className="
          flex
          justify-center
          items-center
          gap-2
          bg-red-500
          text-white
          rounded-lg
          py-3
          mb-5
        "
      >

        Abrir Gmail

        <ExternalLink size={16}/>

      </a>





      {
        resent && (

          <p className="
            text-green-600
            text-sm
            mb-4
          ">

            Email reenviado!

          </p>

        )
      }




      <button

        onClick={handleResend}

        disabled={
          resending ||
          cooldown > 0
        }

        className="
          text-yellow-600
          font-medium
          flex
          items-center
          justify-center
          gap-2
          mx-auto
        "

      >

        {
          resending
          ?
          <Loader2
            size={16}
            className="animate-spin"
          />

          :

          <RefreshCw size={16}/>

        }


        {
          cooldown > 0
          ?
          `Reenviar em ${cooldown}s`
          :
          "Reenviar email de verificação"
        }


      </button>



      <Link href="/login">

        <Button
          variant="outline"
          fullWidth
          className="mt-6"
        >

          Voltar ao Login

        </Button>

      </Link>



    </div>

  );

}







export default function VerifyEmailPage(){


  return (

    <div className="
      min-h-screen
      bg-gray-50
      flex
      items-center
      justify-center
      px-4
    ">


      <div className="w-full max-w-md">


        <div className="
          bg-white
          border
          rounded-2xl
          shadow-sm
          p-8
        ">


          <Suspense
            fallback={
              <Loader2
                className="
                  animate-spin
                  mx-auto
                "
              />
            }
          >

            <VerifyEmailContent />

          </Suspense>


        </div>


      </div>


    </div>

  );

}
