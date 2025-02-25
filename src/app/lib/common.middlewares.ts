import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodType} from 'zod';
import { asyncLocalStorage } from "./aynclocalstorage";
// Authentication Middleware
async function authMiddleware(req: Request) {
    const token = req.headers.get("authorization");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

type ValidationSchema<TBody = unknown, TQuery = unknown, TParams = unknown> = {
  body?: ZodType<TBody>;   // Optional body schema
  query?: ZodType<TQuery>; // Optional query schema
  params?: ZodType<TParams>; // Optional params schema
};


function validationMiddleware<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
>(schema: ValidationSchema<TBody, TQuery, TParams>) {
  return async (req: NextRequest) => {
    try {
      const body = schema.body ? await req.json() : undefined;
      const query = schema.query
        ? Object.fromEntries(req.nextUrl.searchParams)
        : undefined;
      const params = schema.params ? {} : undefined; // Handle dynamic params

      const dataToValidate = {
        body,
        query,
        params,
      };
      const returnData: {body?:TBody, query?: TQuery, params?: TParams} = {};
      if (schema.body) {
        returnData.body = schema.body.parse(dataToValidate.body); // Validate body
      }
      if (schema.query) {
        returnData.query = schema.query.parse(dataToValidate.query); // Validate query
      }
      if (schema.params) {
        returnData.params = schema.params.parse(dataToValidate.params); // Validate params
      }
      const store = asyncLocalStorage.getStore();
      store?.set("reqData", returnData);
      return req; // If validation is successful, continue the request
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      // In case of unexpected error
      return NextResponse.json(
        { error: "Internal server error", details: (error as Error).message || {} },
        { status: 500 }
      );
    }
  };
}

async function loggerMiddleware (req: NextRequest) {
  console.log(`Request made: ${req.nextUrl}:: ${req.nextUrl.pathname}`);
  return req;
};


export {authMiddleware, validationMiddleware, loggerMiddleware}