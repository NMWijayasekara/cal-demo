import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateTokens } from "@/lib/auth";

const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Find user in the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true, // Only selecting it to compare, it won't be sent in the response
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({
          message: "User with email doesn't exist",
          data: null,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate password
    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ message: "Incorrect password", data: null }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate tokens
    const accessToken = await generateTokens(user.id, user.email);

    // Set httpOnly cookies for tokens in the response headers
    return new Response(
      JSON.stringify({
        message: "User signed in successfully",
        data: { id: user.id, email: user.email }, // Excluding the password in the response
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${ACCESS_TOKEN_EXPIRATION_TIME}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: `Error signing in user: ${error.message}`,
        data: null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
