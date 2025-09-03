// 共通日付ユーティリティ
import dayjs from 'dayjs';

export default class DateUtil {
  /**
   * 本日00:00:00のタイムスタンプを返す
   */
  static getTodayStartTimestamp(): number {
    return dayjs().startOf('day').valueOf();
  }

  /**
   * 任意の日付を0:00:00にしてタイムスタンプを返す
   */
  static toStartOfDay(date: Date): number {
    return dayjs(date).startOf('day').valueOf();
  }
}
