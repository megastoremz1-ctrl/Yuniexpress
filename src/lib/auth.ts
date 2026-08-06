import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "./db";


const providers = [];


if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {

  providers.push(

    GoogleProvider({

      clientId:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

    })

  );

}



providers.push(

  CredentialsProvider({

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



      if(
        !user ||
        !user.password
      ){

        throw new Error(
          "INVALID_CREDENTIALS"
        );

      }



      const passwordValid =
        await bcrypt.compare(

          password,

          user.password

        );



      if(!passwordValid){

        throw new Error(
          "INVALID_CREDENTIALS"
        );

      }



      /*
        CLIENT precisa verificar email

        ADMIN e SUPER_ADMIN entram direto
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

        image: user.image,

        role: user.role,

      };


    },


  })

);



export const {
  handlers,
  auth,
  signIn,
  signOut

} = NextAuth({



  providers,



  session: {

    strategy:"jwt",

  },



  pages: {

    signIn:"/login",

    error:"/login",

  },



  callbacks:{



    async signIn({
      user,
      account
    }){


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


              email:
                user.email,


              name:
                user.name,


              image:
                user.image,


              emailVerified:
                new Date(),


              role:
                "CUSTOMER",


            }


          });


        }


      }



      return true;


    },





    async jwt({

      token,

      user,

    }) {



      if(user){


        token.id =
          String(user.id);



        token.role =
          String(
            (user as any).role
          );


      }



      return token;


    },





    async session({

      session,

      token,

    }) {



      if(session.user){


        session.user.id =
          token.id as string;



        (session.user as any).role =
          token.role;


      }



      return session;


    },



  },



  secret:

    process.env.AUTH_SECRET,


});
