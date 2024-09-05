import { NextApiRequest, NextApiResponse } from "next";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateTokens, setAuthCookies } from "@/lib/auth";

const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 15 minutes in milliseconds

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Find user in the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    }); 

    if (!user) {
      return new Response("User with email doesn't exist", {
        status: 404,
      });
    }


    // Validate password
    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return new Response("Incorrect Password", {
        status: 401,
      });
    }

    // Generate tokens
    const accessToken = await generateTokens(user.id, user.email);

    // Set httpOnly cookies for tokens in the response headers
    return new Response("User signed in successfully", {
      status: 200,
      headers: {
        "Set-Cookie": `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${ACCESS_TOKEN_EXPIRATION_TIME}`,
      },
    });
  } catch (error) {
    console.error(error)
    return new Response(`Error signing in user: ${error.message}`, {
      status: 500,
    });
  }
}
