import { NextRequest, NextResponse } from "next/server";
import { asyncLocalStorage } from "./aynclocalstorage";

export function withMiddlewares(...middlewares: ((req: NextRequest) => Promise<NextResponse | NextRequest | void>)[]) {
  return async (req: NextRequest) => {
    let modifiedReq = req;
    const store = new Map<string, unknown>();
    return asyncLocalStorage.run(store, async()=>{
      for (const middleware of middlewares) {
        const result = await middleware(modifiedReq);
        if (result instanceof NextResponse) return result; // Stop chain if response is modified
        modifiedReq = result || modifiedReq;
  
      }
  
      return NextResponse.next();
    })
  };
}