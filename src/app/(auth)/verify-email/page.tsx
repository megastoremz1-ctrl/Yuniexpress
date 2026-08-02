import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendEmailVerification } from "@/lib/services/email";

export const dynamic = "force-dynamic";


// ===============================
// GET - Confirmar email pelo token
// ===============================

export async function GET(
  request: NextRequest
): Promise<NextResponse> {

  try {

    const { searchParams } =
      new URL(request.url);


    const token =
      searchParams.get("token");



    if (!token) {

      return NextResponse.json(
        {
          error:
          "Token de verificação não fornecido."
        },
        {
          status: 400
        }
      );

    }




    const verificationToken =
      await prisma.verificationToken.findUnique({

        where: {
          token
        }

      });





    if (!verificationToken) {

      return NextResponse.json(
        {
          error:
          "Token inválido ou já utilizado."
        },
        {
          status:400
        }
      );

    }





    // verificar expiração

    if (
      new Date() >
      verificationToken.expires
    ) {


      await prisma.verificationToken.delete({

        where:{

          identifier_token:{

            identifier:
            verificationToken.identifier,

            token:
            verificationToken.token

          }

        }

      });



      return NextResponse.json(
        {
          error:
          "Token expirado. Solicite um novo email."
        },
        {
          status:400
        }
      );

    }





    // Atualizar usuário

    await prisma.user.update({

      where:{

        email:
        verificationToken.identifier

      },

      data:{

        emailVerified:
        new Date()

      }

    });





    // Remover token usado

    await prisma.verificationToken.delete({

      where:{

        identifier_token:{

          identifier:
          verificationToken.identifier,

          token:
          verificationToken.token

        }

      }

    });





    return NextResponse.json({

      success:true,

      message:
      "Email verificado com sucesso! Já pode iniciar sessão."

    });





  } catch(error) {


    console.error(
      "VERIFY EMAIL ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:
        "Erro interno ao verificar email."
      },

      {
        status:500
      }

    );


  }

}








// ===============================
// POST - Reenviar email
// ===============================


export async function POST(
  request: NextRequest
): Promise<NextResponse> {


  try {


    const body =
      await request.json();



    const email =
      body.email
      ?.toLowerCase()
      ?.trim();





    if (!email) {


      return NextResponse.json(

        {
          error:
          "Email é obrigatório."
        },

        {
          status:400
        }

      );


    }





    const user =
      await prisma.user.findUnique({

        where:{
          email
        }

      });






    /*
      Não revelar se existe usuário
    */

    if (!user) {


      return NextResponse.json({

        message:
        "Se o email existir, receberá um novo link."

      });


    }






    if(user.emailVerified){


      return NextResponse.json(

        {
          error:
          "Este email já foi verificado."
        },

        {
          status:400
        }

      );


    }







    // remover tokens antigos

    await prisma.verificationToken.deleteMany({

      where:{

        identifier:
        email

      }

    });







    // criar novo token

    const token =
      crypto
      .randomBytes(32)
      .toString("hex");






    await prisma.verificationToken.create({

      data:{

        identifier:
        email,

        token,

        expires:

        new Date(

          Date.now()
          +
          24 *
          60 *
          60 *
          1000

        )

      }

    });








    await sendEmailVerification(

      email,

      user.name ||
      "Cliente",

      token

    );








    return NextResponse.json({

      success:true,

      message:
      "Email de verificação reenviado com sucesso."

    });








  } catch(error) {


    console.error(
      "RESEND EMAIL ERROR:",
      error
    );



    return NextResponse.json(

      {
        error:
        "Erro interno ao reenviar email."
      },

      {
        status:500
      }

    );


  }


}
