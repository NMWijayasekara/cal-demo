import { sign, verify } from "jsonwebtoken";
import { NextApiResponse } from "next";
import prisma from "./prisma";

export async function generateTokens(id: string, email: string) {
  const jwtPayload = { id, email };

  const accessToken = sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  return accessToken;
}

export function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}
