import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken");

  if (!accessToken) {
    return new Response("No token provided", {
      status: 401,
    });
  }

  try {
    // Verify access token
    const user = await verifyToken(accessToken.value);

    if (!user) {
      return new Response("Invalid token", {
        status: 401,
      });
    }

    return new Response(`User authenticated: ${JSON.stringify(user)}`, {
      status: 200,
    });
  } catch (error) {
    return new Response(`Error checking authentication: ${error.message}`, {
      status: 500,
    });
  }
}
