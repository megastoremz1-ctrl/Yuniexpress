import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import { prisma } from "./db";

/**
 * Erro personalizado para email não verificado.
 */
class EmailNotVerifiedError extends CredentialsSignin {
  constructor() {
    super();
    this.code = "EMAIL_NOT_VERIFIED";
  }

  code = "EMAIL_NOT_VERIFIED";
}

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
        throw new CredentialsSignin();
      }

      const email = String(credentials.email)
        .trim()
        .toLowerCase();

      const password = String(credentials.password);

      /**
       * Procurar utilizador
       */
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      /**
       * Utilizador não existe
       */
      if (!user || !user.password) {
        throw new CredentialsSignin();
      }

      /**
       * Validar password
       */
      const passwordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordValid) {
        throw new CredentialsSignin();
      }

      /**
       * ADMIN e SUPER_ADMIN
       */
      const isAdmin =
        user.role === Role.ADMIN ||
        user.role === Role.SUPER_ADMIN;

      /**
       * CUSTOMER precisa confirmar email
       */
      if (!user.emailVerified && !isAdmin) {
        throw new EmailNotVerifiedError();
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
   * =========================================
   * SIGN IN
   * =========================================
   */
  async signIn({ user, account }) {

    /**
     * =========================================
     * LOGIN COM GOOGLE
     * =========================================
     */
    if (account?.provider === "google" && user.email) {

      const email = user.email
        .trim()
        .toLowerCase();

      let existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      /**
       * Criar utilizador caso não exista
       */
      if (!existingUser) {

        existingUser = await prisma.user.create({

          data: {

            email,

            name:
              user.name ??
              "Cliente YuniExpress",

            image:
              user.image ?? null,

            /**
             * O Google já confirmou o email.
             */
            emailVerified: new Date(),

            role: Role.CUSTOMER,

          },

        });

      } else {

        /**
         * Atualizar nome, foto e confirmar email
         */
        existingUser = await prisma.user.update({

          where: {
            id: existingUser.id,
          },

          data: {

            emailVerified:
              existingUser.emailVerified ??
              new Date(),

            ...(user.name
              ? {
                  name: user.name,
                }
              : {}),

            ...(user.image
              ? {
                  image: user.image,
                }
              : {}),

          },

        });

      }

      /**
       * Utilizar sempre o ID do Prisma
       */
      user.id = existingUser.id;
      user.email = existingUser.email;
      user.name = existingUser.name;
      user.image = existingUser.image;

      (user as any).role =
        existingUser.role;

      (user as any).emailVerified =
        existingUser.emailVerified;

      return true;
    }

    /**
     * =========================================
     * LOGIN COM CREDENTIALS
     * =========================================
     *
     * Toda a validação já foi feita no authorize().
     */
    if (account?.provider === "credentials") {
      return true;
    }

    return true;
  },

  /**
   * =========================================
   * JWT
   * =========================================
   */
  async jwt({ token, user }) {

    /**
     * Primeiro login
     */
    if (user) {

      token.id = String(user.id);

      token.role =
        (user as any).role ??
        Role.CUSTOMER;

      token.emailVerified =
        (user as any).emailVerified ??
        null;
    }

    /**
     * Atualizar sempre os dados do banco
     */
    if (typeof token.id === "string") {
  try {
    const databaseUser = await prisma.user.findUnique({
      where: {
        id: token.id,
      },
      select: {
        role: true,
        emailVerified: true,
      },
    });

    if (databaseUser) {
      token.role = databaseUser.role;
      token.emailVerified = databaseUser.emailVerified;
    }
  } catch (error) {
    console.error("JWT database error:", error);
  }
}

    return token;

  },

  /**
   * =========================================
   * SESSION
   * =========================================
   */
  async session({ session, token }) {

    if (session.user) {

      (session.user as any).id = String(token.id);

      (session.user as any).role =
        token.role;

      (session.user as any).emailVerified =
        token.emailVerified;

    }

    return session;

  },

}, // fecha callbacks

secret: process.env.AUTH_SECRET,
});
