import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

interface CandleCountOption {
  value: string;
  label: string;
}

class CandleCountUtil {
  // Available candle count options
  private static readonly CANDLE_COUNT_OPTIONS: CandleCountOption[] = [
    { value: "10", label: "10本" },
    { value: "30", label: "30本" },
    { value: "50", label: "50本" },
  ];

  /**
   * Convert candle count options to SelectOption format for use with BasicSelect component
   */
  public static toSelectOptions(): SelectOptionType[] {
    return this.CANDLE_COUNT_OPTIONS.map(option => ({
      label: option.label,
      value: option.value
    }));
  }

  /**
   * Get the default candle count
   */
  public static getDefaultCandleCount(): string {
    return "30";
  }

  /**
   * Validate if a string is a valid candle count
   */
  public static isValidCandleCount(value: string): boolean {
    return this.CANDLE_COUNT_OPTIONS.some(option => option.value === value);
  }

  /**
   * Convert string value to number
   */
  public static toNumber(value: string): number {
    return parseInt(value, 10);
  }
}

export default CandleCountUtil;
