"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Package
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";


export default function LoginPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [showPassword,setShowPassword] = useState(false);
  const [loading,setLoading] = useState(false);



  async function handleSubmit(
    e: React.FormEvent
  ){

    e.preventDefault();

    setLoading(true);


    try{


      const result =
        await signIn(
          "credentials",
          {
            email,
            password,
            redirect:false
          }
        );



      if(result?.error){


        /*
          Cliente sem email confirmado
        */

        if(
          result.error.includes(
            "EMAIL_NOT_VERIFIED"
          )
        ){

          router.push(
            `/verify-email?email=${encodeURIComponent(email)}`
          );

          return;

        }



        toast.error(
          "Email ou password incorretos"
        );

        return;

      }



      toast.success(
        "Login efectuado com sucesso!"
      );


      router.push("/");

      router.refresh();



    }catch(error){

      toast.error(
        "Erro ao iniciar sessão"
      );


    }finally{

      setLoading(false);

    }

  }





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


        {/* Logo */}

        <div className="
          text-center
          mb-8
        ">

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
            "
          >

            <img
              src="/icons/icon-192x192.png"
              alt="YuniExpress"
              className="
                w-14
                h-14
                rounded-xl
              "
            />

          </Link>


          <h1 className="
            text-2xl
            font-bold
            mt-4
          ">

            Bem-vindo de volta

          </h1>


          <p className="
            text-gray-500
            mt-1
          ">

            Entre na sua conta YuniExpress

          </p>


        </div>




        <form
          onSubmit={handleSubmit}
          className="
            bg-white
            p-8
            rounded-2xl
            border
            shadow-sm
          "
        >



          <div className="space-y-4">


            <Input

              label="Email"

              type="email"

              value={email}

              onChange={
                e=>setEmail(e.target.value)
              }

              placeholder="seu@email.com"

              icon={
                <Mail size={18}/>
              }

              required

            />




            <div className="relative">


              <Input

                label="Password"

                type={
                  showPassword
                  ?
                  "text"
                  :
                  "password"
                }

                value={password}

                onChange={
                  e=>setPassword(e.target.value)
                }

                placeholder="Sua password"

                icon={
                  <Lock size={18}/>
                }

                required

              />



              <button

                type="button"

                onClick={
                  ()=>setShowPassword(!showPassword)
                }

                className="
                  absolute
                  right-3
                  top-9
                  text-gray-400
                "

              >

                {
                  showPassword
                  ?
                  <EyeOff size={18}/>
                  :
                  <Eye size={18}/>
                }

              </button>


            </div>


          </div>



          <div className="
            flex
            justify-end
            mt-3
          ">

            <Link
              href="/forgot-password"
              className="
                text-sm
                text-yellow-600
              "
            >

              Esqueceu a password?

            </Link>


          </div>




          <Button

            type="submit"

            fullWidth

            loading={loading}

            className="mt-6"

            size="lg"

          >

            Entrar

          </Button>




          <div className="
            text-center
            mt-6
            text-sm
            text-gray-500
          ">


            Não tem conta?


            <Link

              href="/register"

              className="
                text-yellow-600
                font-medium
                ml-1
              "

            >

              Registar-se

            </Link>


          </div>



        </form>


      </div>


    </div>

  );

}
