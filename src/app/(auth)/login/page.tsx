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
  Package,
  AlertCircle,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";



export default function LoginPage() {


  const router = useRouter();


  const [email,setEmail] =
    useState("");

  const [password,setPassword] =
    useState("");

  const [showPassword,setShowPassword] =
    useState(false);

  const [loading,setLoading] =
    useState(false);



  const handleSubmit = async(
    e:React.FormEvent
  )=>{


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





      /*
        Email não verificado
      */


      if(
        result?.error
        &&
        result.error.includes(
          "EMAIL_NOT_VERIFIED"
        )
      ){


        router.push(
          `/verify-email?email=${encodeURIComponent(email)}`
        );


        return;

      }





      /*
        Login errado
      */


      if(result?.error){


        toast.error(
          "Email ou password incorretos."
        );


        return;

      }





      /*
        Login sucesso
      */


      toast.success(
        "Login efetuado com sucesso!"
      );


      router.push("/");

      router.refresh();




    }catch(error){


      console.error(
        "LOGIN ERROR:",
        error
      );


      toast.error(
        "Erro ao iniciar sessão."
      );


    }finally{


      setLoading(false);


    }


  };






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


          <Link href="/">

            <img

              src="/icons/icon-192x192.png"

              alt="YuniExpress"

              className="
                w-14
                h-14
                rounded-xl
                mx-auto
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
                e=>setEmail(
                  e.target.value
                )
              }

              placeholder="
              seuemail@gmail.com
              "

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
                  e=>setPassword(
                    e.target.value
                  )
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
                  ()=>setShowPassword(
                    !showPassword
                  )
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

            size="lg"

            className="mt-6"

          >

            Entrar

          </Button>








          <div className="
            relative
            my-6
          ">

            <div className="
              border-t
            "/>


            <span className="
              absolute
              left-1/2
              -translate-x-1/2
              -top-3
              bg-white
              px-3
              text-sm
              text-gray-500
            ">

              ou

            </span>


          </div>








          <button

            type="button"

            onClick={
              ()=>signIn(
                "google",
                {
                  callbackUrl:"/"
                }
              )
            }


            className="
              w-full
              flex
              items-center
              justify-center
              gap-3
              border-2
              rounded-lg
              py-3
              hover:bg-gray-50
            "

          >


            <span>
              🇬🇴
            </span>


            Continuar com Google


          </button>






        </form>






        <p className="
          text-center
          mt-6
          text-sm
          text-gray-500
        ">


          Não tem uma conta?


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



        </p>



      </div>


    </div>

  );

}
