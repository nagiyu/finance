import { TimeType } from "@common/interfaces/TimeType";

export default class TimeUtil {
  public static formatTime(value: TimeType): string {
    return `${value.hour}:${value.minute.toString().padStart(2, '0')}`;
  }

  public static parseTime(value: string): TimeType {
    const [hour, minute] = value.split(':').map(Number);
    return { hour, minute };
  }
}
