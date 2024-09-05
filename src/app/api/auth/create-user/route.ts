import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateTokens, setAuthCookies } from "@/lib/auth";

const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Hash password
    const hashedPassword = await hash(password, 12);

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
    return new Response(`User created successfully: ${JSON.stringify(user)}`, {
      status: 201,
      headers: {
        "Set-Cookie": `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${ACCESS_TOKEN_EXPIRATION_TIME}`,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return new Response("User with email already exists", {
        status: 400,
      });
    }
    return new Response(`Error creating user: ${error.message}`, {
      status: 500,
    });
  }
}
