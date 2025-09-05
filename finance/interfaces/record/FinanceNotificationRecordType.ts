import { FinanceNotificationConditionType, FinanceNotificationTimeFrameType, FinanceNotificationModeType, FinanceNotificationFrequencyType } from '@finance/types/FinanceNotificationType';
import { FinanceRecordTypeBase } from '@finance/interfaces/record/FinanceRecordTypeBase';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';

export interface FinanceNotificationRecordType extends FinanceRecordTypeBase {
  DataType: typeof FINANCE_RECORD_DATA_TYPE.FINANCE_NOTIFICATION;
  TerminalID: string;
  SubscriptionEndpoint: string;
  SubscriptionKeysP256dh: string;
  SubscriptionKeysAuth: string;
  ExchangeID: string;
  TickerID: string;
  // Legacy fields (for backward compatibility)
  ConditionType: FinanceNotificationConditionType;
  ConditionValue: number;
  // New fields
  Mode?: FinanceNotificationModeType;
  Conditions?: string; // JSON-stringified array
  TimeFrame: FinanceNotificationTimeFrameType;
  Session?: string; // Session type for price data
  Frequency?: FinanceNotificationFrequencyType;
  FirstNotificationSent?: boolean;
}
