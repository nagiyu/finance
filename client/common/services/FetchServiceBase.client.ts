import { DataTypeBase } from '@common/interfaces/data/DataTypeBase';
import ErrorUtil from '@common/utils/ErrorUtil';

import ResponseValidator from '@client-common/utils/ResponseValidator';

export default abstract class FetchServiceBase<T extends DataTypeBase> {
  protected readonly endpoint: string;

  public constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async get(): Promise<T[]> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'GET'
      });

      this.validateResponse(response);
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ErrorUtil.throwError(`Error getting data from ${this.endpoint}: ${errorMessage}`);
    }
  }

  public async getById(id: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.endpoint}/${id}`, {
        method: 'GET'
      });

      if (response.status === 404) {
        return null;
      }

      this.validateResponse(response);
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ErrorUtil.throwError(`Error getting data by ID from ${this.endpoint}: ${errorMessage}`);
    }
  }

  public async create(data: T): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      this.validateResponse(response);
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ErrorUtil.throwError(`Error creating data at ${this.endpoint}: ${errorMessage}`);
    }
  }

  public async update(data: T): Promise<T> {
    try {
      const response = await fetch(`${this.endpoint}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      this.validateResponse(response);
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ErrorUtil.throwError(`Error updating data at ${this.endpoint}: ${errorMessage}`);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/${id}`, {
        method: 'DELETE'
      });

      this.validateResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ErrorUtil.throwError(`Error deleting data at ${this.endpoint}: ${errorMessage}`);
    }
  }

  protected validateResponse(response: Response): void {
    ResponseValidator.ValidateResponse(response);
  }
}
