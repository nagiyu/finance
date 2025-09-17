import ResponseValidator from '@client-common/utils/ResponseValidator';
import { UUIDResponse } from '@client-common/routes/common/uuid/route';

export default class CommonFetchService {
  public async getUUID(): Promise<string> {
    const response = await fetch('/api/common/uuid', {
      method: 'GET'
    });

    ResponseValidator.ValidateResponse(response);

    const data: UUIDResponse = await response.json();

    return data.uuid;
  }
}
