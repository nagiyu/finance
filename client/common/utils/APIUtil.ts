import { NextResponse } from "next/server";

export default class APIUtil {
  public static ReturnSuccess(data?: object) {
    if (!data) {
      return new NextResponse(null);
    }

    return NextResponse.json(data);
  }

  public static ReturnSuccessWithObject(data: object) {
    return NextResponse.json(data);
  }

  public static ReturnBadRequest(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  public static ReturnUnauthorized(): NextResponse {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  public static ReturnNotFound(message: string = 'Not Found'): NextResponse {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  public static ReturnInternalServerError(data: object): NextResponse {
    return NextResponse.json(data, { status: 500 });
  }

  public static ReturnInternalServerErrorWithError(error: any): NextResponse {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
