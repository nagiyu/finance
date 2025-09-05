import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

interface SessionOption {
  value: string;
  label: string;
}

export default class SessionUtil {
  // Available session options with user-friendly labels
  private static readonly SESSION_OPTIONS: SessionOption[] = [
    { value: "regular", label: "通常時間" },
    { value: "extended", label: "時間外取引含む" },
  ];

  /**
   * Convert session options to SelectOption format for use with BasicSelect component
   */
  public static toSelectOptions(): SelectOptionType[] {
    return this.SESSION_OPTIONS.map(option => ({
      label: option.label,
      value: option.value
    }));
  }

  /**
   * Get the default session (extended as specified in requirements)
   */
  public static getDefaultSession(): string {
    return "extended";
  }

  /**
   * Validate if a string is a valid session
   */
  public static isValidSession(value: string): boolean {
    return this.SESSION_OPTIONS.some(option => option.value === value);
  }
}