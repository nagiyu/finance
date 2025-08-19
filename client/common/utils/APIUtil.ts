import { NextResponse } from "next/server";

export default class APIUtil {
  public static ReturnSuccess() {
    return new NextResponse(null);
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
}
