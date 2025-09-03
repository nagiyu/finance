/**
 * Utility for handling errors in the application.
 */
export default class ErrorUtil {
  /**
   * Throws an error with the provided message.
   * @param message The error message to throw.
   * @throws Throws an Error with the specified message.
   */
  public static throwError(message: string): never {
    console.error(message);
    throw new Error(message);
  }
}
