import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';

import ResponseValidator from '@client-common/utils/ResponseValidator';

export default abstract class FetchServiceBase<T extends DataTypeBase> {
  protected readonly endpoint: string;

  public constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async get(): Promise<T[]> {
    const response = await fetch(this.endpoint, {
      method: 'GET'
    });

    this.validateResponse(response);

    return await response.json();
  }

  public async create(data: T): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    this.validateResponse(response);

    return await response.json();
  }

  public async update(data: T): Promise<T> {
    const response = await fetch(`${this.endpoint}/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    this.validateResponse(response);

    return await response.json();
  }

  public async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE'
    });

    this.validateResponse(response);
  }

  protected validateResponse(response: Response): void {
    ResponseValidator.ValidateResponse(response);
  }
}
