import { authMiddleware, loggerMiddleware, validationMiddleware } from "~/app/lib/common.middlewares";
import { withMiddlewares } from "~/app/lib/middlewares";
import { z } from 'zod'
import { NextRequest, NextResponse } from "next/server";


export async function getHandler() {
  return new NextResponse(JSON.stringify({ message: "Hello, Next.js!" }), {
    headers: { "Content-Type": "application/json" },
  });
}

// Define the schema for validation
const userSchema = {
  body: z.object({
    username: z.string().min(3),
    email: z.string().email(),
    age: z.number().min(18),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(), // Ensure page is a number as a string
  }),
};

async function postHandler(req: NextRequest) {
  const body = await req.json(); // Read request body
  return new NextResponse(JSON.stringify({ message: "User created", data: body }), {
    headers: { "Content-Type": "application/json" },
    status: 201,
  });
}
export const GET = withMiddlewares(loggerMiddleware, authMiddleware, getHandler);
export const POST = withMiddlewares(authMiddleware, validationMiddleware(userSchema), postHandler);