import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";

export const { 
  handlers, 
  signIn, 
  signOut, 
  auth 
} = NextAuth({

  providers: [

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),


    Credentials({

      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },


      async authorize(credentials) {


        if(
          !credentials?.email ||
          !credentials?.password
        ){

          throw new Error(
            "INVALID_CREDENTIALS"
          );

        }


        const email =
          String(credentials.email)
          .toLowerCase()
          .trim();


        const password =
          String(credentials.password);



        const user =
          await prisma.user.findUnique({

            where:{
              email
            }

          });



        if(!user){

          throw new Error(
            "INVALID_CREDENTIALS"
          );

        }



        if(!user.password){

          throw new Error(
            "INVALID_CREDENTIALS"
          );

        }



        const passwordMatch =
          await bcrypt.compare(
            password,
            user.password
          );



        if(!passwordMatch){

          throw new Error(
            "INVALID_CREDENTIALS"
          );

        }



        /*
          Regra:

          CLIENT
          -> precisa confirmar email

          ADMIN
          -> entra sem confirmar

          SUPER_ADMIN
          -> entra sem confirmar

        */


        if(
          !user.emailVerified &&
          user.role !== "ADMIN" &&
          user.role !== "SUPER_ADMIN"
        ){

          throw new Error(
            "EMAIL_NOT_VERIFIED"
          );

        }



        return {

          id: user.id,

          name: user.name,

          email: user.email,

          role: user.role,

        };


      },

    }),

  ],



  callbacks:{


    async signIn({ 
      user,
      account
    }) {


      /*
       Google login

       Se o utilizador entrar
       pelo Google, marcar email
       como verificado
      */


      if(
        account?.provider === "google"
        &&
        user.email
      ){

        const existing =
          await prisma.user.findUnique({

            where:{
              email:user.email
            }

          });



        if(!existing){

          await prisma.user.create({

            data:{

              email:user.email,

              name:user.name,

              image:user.image,

              emailVerified:new Date(),

              role:"CUSTOMER",

            }

          });


        }


      }


      return true;

    },




 async jwt({
  token,
  user
}) {

  if(user){

    token.id = String(user.id);

    token.role = String(user.role);

  }

  return token;

},




    async session({
      session,
      token
    }) {


      if(session.user){


        session.user.id =
          token.id as string;


        session.user.role =
          token.role as string;


      }


      return session;

    },


  },



  pages:{

    signIn:"/login",

  },



  session:{

    strategy:"jwt",

  },


  secret:
    process.env.AUTH_SECRET,


});
