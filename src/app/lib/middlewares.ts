import { NextRequest, NextResponse } from "next/server";

export function withMiddlewares(...middlewares: ((req: NextRequest) => Promise<NextResponse | NextRequest | void>)[]) {
    return async (req: NextRequest) => {
      let modifiedReq = req;
      
      for (const middleware of middlewares) {
        const result = await middleware(modifiedReq);
        if (result instanceof NextResponse) return result; // Stop chain if response is modified
        modifiedReq = result || modifiedReq;
      }
  
      return NextResponse.next();
    };
  }