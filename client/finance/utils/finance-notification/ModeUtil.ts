import ErrorUtil from '@common/utils/ErrorUtil';

import { FinanceNotificationConditionModeType } from '@finance/types/FinanceNotificationType';
import { FINANCE_NOTIFICATION_CONDITION_MODE } from '@finance/consts/FinanceNotificationConst';

import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

export default class ModeUtil {
  public static formatMode(mode: FinanceNotificationConditionModeType): string {
    switch (mode) {
      case FINANCE_NOTIFICATION_CONDITION_MODE.BUY:
        return '買い';
      case FINANCE_NOTIFICATION_CONDITION_MODE.SELL:
        return '売り';
      default:
        ErrorUtil.throwError(`Unknown mode type: ${mode}`);
    }
  }

  public static getModeOptions(): SelectOptionType[] {
    const options: SelectOptionType[] = [];

    Object.values(FINANCE_NOTIFICATION_CONDITION_MODE).forEach((mode) => {
      options.push({
        label: ModeUtil.formatMode(mode),
        value: mode,
      });
    });

    return options;
  }
}
