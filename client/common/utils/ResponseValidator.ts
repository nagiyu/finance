import ErrorUtil from '@common/utils/ErrorUtil';

export default class ResponseValidator {
  public static ValidateResponse(response: Response): void {
    switch (response.status) {
      case 200:
        break;
      case 400:
        ErrorUtil.throwError("Bad Request");
      case 401:
        ErrorUtil.throwError("Unauthorized");
      case 404:
        ErrorUtil.throwError("Not Found");
      case 500:
        ErrorUtil.throwError("Internal Server Error");
      default:
        ErrorUtil.throwError("Unknown Error");
    }
  }
}
