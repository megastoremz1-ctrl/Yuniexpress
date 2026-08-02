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


  const [message,setMessage] = useState("");

  const [resending,setResending] = useState(false);

  const [resent,setResent] = useState(false);

  const [cooldown,setCooldown] = useState(0);



  /*
    Contador para evitar spam
  */

  useEffect(()=>{

    if(cooldown <= 0)
      return;


    const timer =
      setInterval(()=>{

        setCooldown(
          value => value - 1
        );

      },1000);



    return ()=>clearInterval(timer);


  },[cooldown]);





  /*
    Confirmar token recebido no email
  */

  useEffect(()=>{

    if(token){

      verifyToken(token);

    }

  },[token]);





  async function verifyToken(
    tokenValue:string
  ){

    setStatus("verifying");


    try{


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
          "Não foi possível verificar o email."
        );


      }


    }catch{


      setStatus("error");

      setMessage(
        "Erro de conexão. Tente novamente."
      );


    }


  }







  /*
    Reenviar email
  */

  async function handleResend(){


    if(
      !email ||
      resending ||
      cooldown > 0
    )
      return;



    setResending(true);

    setResent(false);



    try{


      const response =
        await fetch(
          "/api/auth/resend-verification",
          {
            method:"POST",

            headers:{
              "Content-Type":
              "application/json",
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







  /*
    Estado verificando
  */

  if(status === "verifying"){

    return (

      <div className="text-center">


        <div className="
          w-16
          h-16
          rounded-full
          bg-yellow-50
          flex
          items-center
          justify-center
          mx-auto
          mb-6
        ">

          <Loader2
            size={32}
            className="
              text-yellow-500
              animate-spin
            "
          />

        </div>



        <h1 className="
          text-2xl
          font-bold
          mb-2
        ">

          A verificar...

        </h1>


        <p className="text-gray-500">

          Estamos a confirmar o seu email.

        </p>


      </div>

    );

  }







  /*
    Sucesso
  */

  if(status === "success"){

    return (

      <div className="text-center">


        <div className="
          w-16
          h-16
          rounded-full
          bg-green-50
          flex
          items-center
          justify-center
          mx-auto
          mb-6
        ">

          <CheckCircle
            size={32}
            className="text-green-500"
          />

        </div>



        <h1 className="
          text-2xl
          font-bold
          mb-2
        ">

          Email confirmado!

        </h1>



        <p className="
          text-gray-500
          mb-8
        ">

          {message}

        </p>




        <Link href="/login">

          <Button
            size="lg"
            fullWidth
          >

            Fazer Login

          </Button>

        </Link>


      </div>

    );

  }







  /*
    Erro
  */

  if(status === "error"){

    return (

      <div className="text-center">


        <div className="
          w-16
          h-16
          rounded-full
          bg-red-50
          flex
          items-center
          justify-center
          mx-auto
          mb-6
        ">


          <XCircle
            size={32}
            className="text-red-500"
          />


        </div>




        <h1 className="
          text-2xl
          font-bold
          mb-2
        ">

          Verificação falhou

        </h1>



        <p className="
          text-gray-500
          mb-8
        ">

          {message}

        </p>




        <Link href="/login">

          <Button
            size="lg"
            fullWidth
          >

            Voltar ao login

          </Button>

        </Link>



      </div>

    );

  }







  /*
    Estado aguardando email
  */

  return (

    <div className="text-center">


      <div className="
        w-16
        h-16
        bg-yellow-50
        rounded-full
        flex
        items-center
        justify-center
        mx-auto
        mb-6
      ">


        <Mail
          size={32}
          className="text-yellow-500"
        />


      </div>




      <h1 className="
        text-2xl
        font-bold
        mb-2
      ">

        Verifique o seu email

      </h1>




      <p className="text-gray-500">

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

        <p className="
          text-sm
          text-yellow-800
        ">

          Clique no link recebido para ativar a sua conta.
          Verifique também Spam ou Lixo Eletrónico.

        </p>


      </div>





      <a

        href="https://mail.google.com"

        target="_blank"

        className="
          flex
          items-center
          justify-center
          gap-2
          w-full
          py-3
          rounded-lg
          bg-red-500
          text-white
          font-medium
          mb-4
        "

      >

        Abrir Gmail

        <ExternalLink size={16}/>

      </a>






      {
        resent && (

          <p className="
            text-sm
            text-green-600
            mb-4
          ">

            Email reenviado com sucesso!

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
          disabled:opacity-50
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

          <RefreshCw
            size={16}
          />

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

          size="lg"

          className="mt-6"

        >

          Voltar ao login

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


      <div className="
        w-full
        max-w-md
      ">


        <div className="
          text-center
          mb-8
        ">


          <Link href="/">

            <img

              src="/icons/icon-192x192.png"

              alt="YuniExpress"

              className="
                w-12
                h-12
                rounded-xl
                mx-auto
              "

            />

          </Link>


        </div>





        <div className="
          bg-white
          rounded-2xl
          border
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
