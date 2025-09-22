import { TimeFrame } from '@finance/utils/FinanceUtil';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

interface TimeFrameOption {
  value: TimeFrame;
  label: string;
}

class TimeFrameUtil {
  // Available timeframes with user-friendly labels
  private static readonly TIMEFRAME_OPTIONS: TimeFrameOption[] = [
    { value: "1", label: "1分" },
    { value: "3", label: "3分" },
    { value: "5", label: "5分" },
    { value: "15", label: "15分" },
    { value: "30", label: "30分" },
    { value: "45", label: "45分" },
    { value: "60", label: "1時間" },
    { value: "120", label: "2時間" },
    { value: "180", label: "3時間" },
    { value: "240", label: "4時間" },
    { value: "D", label: "日足" },
    { value: "W", label: "週足" },
    { value: "M", label: "月足" },
  ];

  /**
   * Convert timeframe options to SelectOption format for use with BasicSelect component
   */
  public static toSelectOptions(): SelectOptionType[] {
    return this.TIMEFRAME_OPTIONS.map(option => ({
      label: option.label,
      value: option.value
    }));
  }

  /**
   * Get the default timeframe
   */
  public static getDefaultTimeFrame(): TimeFrame {
    return "1";
  }

  /**
   * Validate if a string is a valid timeframe
   */
  public static isValidTimeFrame(value: string): value is TimeFrame {
    return this.TIMEFRAME_OPTIONS.some(option => option.value === value);
  }

  /**
   * Format timeframe value for display
   */
  public static formatTimeFrame(value: TimeFrame): string {
    const option = this.TIMEFRAME_OPTIONS.find(option => option.value === value);
    return option ? option.label : value;
  }
}

export default TimeFrameUtil;