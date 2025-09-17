import CommonUtil from '@common/utils/CommonUtil';

import APIUtil from '@client-common/utils/APIUtil';

export interface UUIDResponse {
  uuid: string;
}

export async function GET() {
  const result: UUIDResponse = {
    uuid: CommonUtil.generateUUID(),
  };
  return APIUtil.ReturnSuccess(result);
}
