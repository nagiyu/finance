import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';

export type ExchangeSessionType = typeof EXCHANGE_SESSION[keyof typeof EXCHANGE_SESSION];
