import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";



export const { handlers, signIn, signOut, auth } = NextAuth({

  providers: [

    Credentials({

      name: "credentials",

      credentials: {

        email:{
          label:"Email",
          type:"email"
        },

        password:{
          label:"Password",
          type:"password"
        }

      },


      async authorize(credentials){


        const email =
          credentials?.email
          ?.toString()
          .toLowerCase()
          .trim();



        const password =
          credentials?.password
          ?.toString();



        if(!email || !password){

          throw new Error(
            "Email e password são obrigatórios."
          );

        }



        /*
          Procurar utilizador
        */

        const user =
          await prisma.user.findUnique({

            where:{
              email
            }

          });




        if(!user){

          throw new Error(
            "Email ou password incorretos."
          );

        }





        /*
          Confirmar email
        */


        if(!user.emailVerified){


          throw new Error(
            "EMAIL_NOT_VERIFIED"
          );


        }





        /*
          Validar password
        */


        const passwordValid =
          await bcrypt.compare(
            password,
            user.password
          );



        if(!passwordValid){

          throw new Error(
            "Email ou password incorretos."
          );

        }





        return {

          id:user.id,

          name:user.name,

          email:user.email,

          role:user.role,

          image:user.image

        };

      }

    }),





    Google({

      clientId:
        process.env.GOOGLE_CLIENT_ID!,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!

    })

  ],







  callbacks:{



    async jwt({token,user}){


      if(user){

        token.id =
          user.id;


        token.role =
          user.role;


      }


      return token;

    },






    async session({session,token}){


      if(session.user){

        session.user.id =
          token.id as string;


        session.user.role =
          token.role as string;


      }


      return session;

    }


  },






  pages:{


    signIn:"/login"

  },






  session:{


    strategy:"jwt"


  },






  secret:
    process.env.AUTH_SECRET,


  trustHost:true


});
