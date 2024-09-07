import { generateTokens } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    // Hash password
    const hashedPassword = (await hash(password, 12)) as string;

    // Create user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = await generateTokens(user.id, user.email);

    // Set httpOnly cookies for tokens in the response headers
    return new Response(
      JSON.stringify({
        message: "User created successfully",
        data: user,
      }),
      {
        status: 201,
        headers: {
          "Set-Cookie": `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${ACCESS_TOKEN_EXPIRATION_TIME}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({
          message: "User with email already exists",
          data: null,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({
        message: `Error creating user: ${error.message}`,
        data: null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
