import ErrorUtil from '@common/utils/ErrorUtil';

import { ConditionInfo } from '@finance/conditions/ConditionBase';
import { FinanceNotificationConditionModeType } from '@finance/types/FinanceNotificationType';

import ResponseValidator from '@client-common/utils/ResponseValidator';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

export default class FinanceNotificationConditionFetchService {
  public async getConditionList(mode: FinanceNotificationConditionModeType): Promise<SelectOptionType[]> {
    try {
      const response = await fetch(`/api/finance-notification/conditions/${mode}`, {
        method: 'GET'
      });

      ResponseValidator.ValidateResponse(response);

      return await response.json();
    } catch (error) {
      ErrorUtil.throwError(null, error);
    }
  }

  public async getConditionInfo(condition: string): Promise<ConditionInfo> {
    try {
      const response = await fetch(`/api/finance-notification/condition/${condition}`, {
        method: 'GET'
      });

      ResponseValidator.ValidateResponse(response);

      return await response.json();
    } catch (error) {
      ErrorUtil.throwError(null, error);
    }
  }
}