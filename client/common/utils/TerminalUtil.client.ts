import ResponseValidator from '@client-common/utils/ResponseValidator';

export default class TerminalUtil {
  private static readonly key = 'terminalId';

  public static async getTerminalId(): Promise<string> {
    const storedTerminalId = localStorage.getItem(TerminalUtil.key);

    if (storedTerminalId) {
      return storedTerminalId;
    }

    const response = await fetch('/api/terminal', {
      method: 'GET'
    });

    ResponseValidator.ValidateResponse(response);

    const { terminalId } = await response.json();

    localStorage.setItem(TerminalUtil.key, terminalId);

    return terminalId;
  }
}
