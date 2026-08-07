import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "./db";

/**
 * YuniExpress - NextAuth
 *
 * Providers:
 * - Credentials
 * - Google
 *
 * Session:
 * - JWT
 */

const providers = [
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
      /**
       * Validar campos
       */
      if (!credentials?.email || !credentials?.password) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const email = String(credentials.email)
        .toLowerCase()
        .trim();

      const password = String(credentials.password);

      /**
       * Procurar usuário
       */
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      /**
       * Usuário não existe
       */
      if (!user || !user.password) {
        throw new Error("INVALID_CREDENTIALS");
      }

      /**
       * Verificar password
       */
      const passwordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordValid) {
        throw new Error("INVALID_CREDENTIALS");
      }

     /**
 * ADMIN e SUPER_ADMIN podem entrar
 * sem confirmar o email.
 */
const isAdmin =
  user.role === "ADMIN" ||
  user.role === "SUPER_ADMIN";

/**
 * CUSTOMER precisa confirmar o email.
 */
if (!user.emailVerified && !isAdmin) {
  throw new Error("EMAIL_NOT_VERIFIED");
}

return {
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  role: user.role,
  emailVerified: user.emailVerified,
} as any;
    },
  }),

  /**
   * GOOGLE
   */
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * ============================
     * SIGN IN
     * ============================
     */
    async signIn({
      user,
      account,
    }) {
      /**
       * ========================================
       * LOGIN COM GOOGLE
       * ========================================
       */
      if (
        account?.provider === "google" &&
        user.email
      ) {
        const email = user.email
          .toLowerCase()
          .trim();

        /**
         * Procurar usuário no banco
         */
        let existingUser =
          await prisma.user.findUnique({
            where: {
              email,
            },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              password: true,
              emailVerified: true,
              role: true,
            },
          });

        /**
         * ========================================
         * USUÁRIO GOOGLE NOVO
         * ========================================
         */
        if (!existingUser) {
          existingUser =
            await prisma.user.create({
              data: {
                email,

                name:
                  user.name ||
                  "Cliente YuniExpress",

                image:
                  user.image || null,

                /**
                 * Google já confirmou o email.
                 */
                emailVerified: new Date(),

                role: "CUSTOMER",
              },

              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                password: true,
                emailVerified: true,
                role: true,
              },
            });
        } else {
          /**
           * ========================================
           * USUÁRIO JÁ EXISTE
           * ========================================
           *
           * Se entrar pelo Google, consideramos
           * o email verificado.
           */
          existingUser =
            await prisma.user.update({
              where: {
                id: existingUser.id,
              },

              data: {
                emailVerified:
                  existingUser.emailVerified ||
                  new Date(),

                /**
                 * Atualizar imagem apenas se
                 * o Google enviar uma.
                 */
                ...(user.image
                  ? {
                      image: user.image,
                    }
                  : {}),

                ...(user.name
                  ? {
                      name: user.name,
                    }
                  : {}),
              },

              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                password: true,
                emailVerified: true,
                role: true,
              },
            });
        }

        /**
         * IMPORTANTE
         *
         * O ID do user do Google pode ser diferente
         * do ID existente no nosso banco.
         *
         * Por isso usamos o ID do nosso Prisma.
         */
        user.id = existingUser.id;

        user.email = existingUser.email;

        user.name = existingUser.name;

        user.image = existingUser.image;

        /**
         * Campos personalizados
         */
        (user as any).role =
          existingUser.role;

        (user as any).emailVerified =
          existingUser.emailVerified;

        return true;
      }

      /**
       * ========================================
       * LOGIN COM EMAIL/PASSWORD
       * ========================================
       */
      if (
        account?.provider === "credentials"
      ) {
        const email = user.email
          ?.toLowerCase()
          .trim();

        if (!email) {
          return false;
        }

        /**
         * Buscar novamente o usuário.
         */
        const databaseUser =
          await prisma.user.findUnique({
            where: {
              email,
            },

            select: {
              id: true,
              email: true,
              emailVerified: true,
              role: true,
            },
          });

        if (!databaseUser) {
          return false;
        }

        /**
         * ADMIN e SUPER_ADMIN podem entrar
         * sem verificação.
         */
        const isAdmin =
          databaseUser.role === "ADMIN" ||
          databaseUser.role === "SUPER_ADMIN";

   /**
 * ========================================
 * LOGIN COM EMAIL/PASSWORD
 * ========================================
 *
 * Toda a validação já foi feita no authorize().
 */
if (account?.provider === "credentials") {
  return true;
}
    /**
     * ============================
     * JWT
     * ============================
     */
    async jwt({
      token,
      user,
    }) {
      /**
       * Primeiro login
       */
      if (user) {
        token.id = String(user.id);

        token.role =
          (user as any).role ||
          "CUSTOMER";

        token.emailVerified =
          (user as any).emailVerified ||
          null;
      }

      /**
       * Se ainda não houver role,
       * tentar buscar do banco.
       */
      if (
        token.id &&
        !token.role
      ) {
        try {
          const databaseUser =
            await prisma.user.findUnique({
              where: {
                id: String(token.id),
              },

              select: {
                role: true,
                emailVerified: true,
              },
            });

          if (databaseUser) {
            token.role =
              databaseUser.role;

            token.emailVerified =
              databaseUser.emailVerified;
          }
        } catch (error) {
          console.error(
            "JWT database error:",
            error
          );
        }
      }

      return token;
    },

    /**
     * ============================
     * SESSION
     * ============================
     */
    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id =
          String(token.id);

        (session.user as any).role =
          token.role;

        (session.user as any).emailVerified =
          token.emailVerified;
      }

      return session;
    },
  },

  secret:
    process.env.AUTH_SECRET,
});
