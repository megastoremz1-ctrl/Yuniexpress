"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");


  const [email, setEmail] = useState(emailParam || "");

  const [status, setStatus] = useState<
    "loading" | "waiting" | "success" | "error"
  >(
    token ? "loading" : "waiting"
  );


  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [sent, setSent] = useState(false);

  const [timer, setTimer] = useState(0);



  useEffect(() => {

    if(token){

      verifyToken();

    }

  }, [token]);




  useEffect(() => {

    if(timer <= 0) return;


    const interval = setInterval(()=>{

      setTimer(value => value - 1);

    },1000);


    return ()=>clearInterval(interval);


  },[timer]);





  async function verifyToken(){

    try{

      const response = await fetch(
        `/api/auth/verify-email?token=${token}`
      );


      const data = await response.json();



      if(response.ok){

        setStatus("success");

        setMessage(
          data.message ||
          "Email verificado com sucesso."
        );


      }else{


        setStatus("error");

        setMessage(
          data.error ||
          "Token inválido."
        );


      }



    }catch{


      setStatus("error");

      setMessage(
        "Erro de conexão."
      );


    }


  }





  async function resend(){


    if(
      !email ||
      sending ||
      timer > 0
    ){

      return;

    }



    try{


      setSending(true);

      setSent(false);



      const response = await fetch(
        "/api/auth/verify-email",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({
            email
          })

        }
      );



      const data = await response.json();



      if(response.ok){


        setSent(true);

        setTimer(60);



      }else{


        setMessage(
          data.error ||
          "Erro ao enviar email."
        );


      }




    }catch{


      setMessage(
        "Erro ao enviar email."
      );


    }finally{


      setSending(false);


    }


  }





  if(status === "loading"){

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





  if(status === "success"){


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
          className="block w-full bg-yellow-500 text-white py-3 rounded-lg"
        >

          Fazer Login

        </Link>


      </div>

    );


  }





  if(status === "error"){


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
          className="block w-full border py-3 rounded-lg"
        >

          Voltar Login

        </Link>


      </div>

    );


  }





  return (

    <div className="text-center">


      <Mail
        size={55}
        className="mx-auto text-yellow-500"
      />



      <h1 className="text-2xl font-bold mt-5">
        Verifique o seu email
      </h1>



      <p className="text-gray-500 mt-3">
        Enviamos um link de confirmação.
      </p>



      <input

        type="email"

        value={email}

        onChange={(e)=>setEmail(e.target.value)}

        placeholder="Seu email"

        className="mt-5 w-full border rounded-lg px-4 py-3"

      />




      {sent && (

        <p className="text-green-600 text-sm mt-4">

          Email reenviado com sucesso.

        </p>

      )}




      <button

        onClick={resend}

        disabled={
          sending ||
          timer > 0
        }

        className="
        mt-5
        text-yellow-600
        flex
        items-center
        justify-center
        gap-2
        mx-auto
        "

      >


        {
          sending ?

          <Loader2
            size={16}
            className="animate-spin"
          />

          :

          <RefreshCw size={16}/>

        }


        {
          timer > 0
          ?
          `Aguarde ${timer}s`
          :
          "Reenviar email"
        }


      </button>




      <Link

        href="/login"

        className="block mt-6 border py-3 rounded-lg"

      >

        Já confirmei - Login

      </Link>


    </div>

  );


}





export default function VerifyEmailPage(){


  return (

    <main className="
    min-h-screen
    bg-gray-50
    flex
    items-center
    justify-center
    px-4
    ">


      <div className="
      bg-white
      rounded-2xl
      border
      shadow-sm
      p-8
      w-full
      max-w-md
      ">


        <Suspense

          fallback={

            <div className="text-center">

              <Loader2
                className="animate-spin mx-auto text-yellow-500"
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
