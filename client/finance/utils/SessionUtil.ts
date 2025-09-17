import ErrorUtil from '@common/utils/ErrorUtil';

import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

interface SessionOption {
  value: ExchangeSessionType;
  label: string;
}

export default class SessionUtil {
  // Available session options with user-friendly labels
  private static readonly SESSION_OPTIONS: SessionOption[] = [
    { value: EXCHANGE_SESSION.REGULAR, label: '通常時間' },
    { value: EXCHANGE_SESSION.EXTENDED, label: '時間外取引含む' },
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
  public static getDefaultSession(): ExchangeSessionType {
    return EXCHANGE_SESSION.EXTENDED;
  }

  /**
   * Validate if a string is a valid session
   */
  public static isValidSession(value: string): boolean {
    return this.SESSION_OPTIONS.some(option => option.value === value);
  }

  public static formatSession(session: ExchangeSessionType): string {
    switch (session) {
      case EXCHANGE_SESSION.REGULAR:
        return '通常時間';
      case EXCHANGE_SESSION.EXTENDED:
        return '時間外取引含む';
      default:
        ErrorUtil.throwError(`Unknown session type: ${session}`);
    }
  }
}