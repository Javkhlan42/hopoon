import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  constructor(private httpService: HttpService) {}

  async forwardRequest(
    serviceUrl: string,
    path: string,
    method: string,
    data?: any,
    headers?: any,
  ): Promise<any> {
    const url = `${serviceUrl}${path}`;
    
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      config.data = data;
    }

    if (data && method === 'GET') {
      config.params = data;
    }

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  }

  async get(serviceUrl: string, path: string, params?: any, headers?: any) {
    return this.forwardRequest(serviceUrl, path, 'GET', params, headers);
  }

  async post(serviceUrl: string, path: string, data: any, headers?: any) {
    return this.forwardRequest(serviceUrl, path, 'POST', data, headers);
  }

  async patch(serviceUrl: string, path: string, data: any, headers?: any) {
    return this.forwardRequest(serviceUrl, path, 'PATCH', data, headers);
  }

  async delete(serviceUrl: string, path: string, headers?: any) {
    return this.forwardRequest(serviceUrl, path, 'DELETE', null, headers);
  }

  async put(serviceUrl: string, path: string, data: any, headers?: any) {
    return this.forwardRequest(serviceUrl, path, 'PUT', data, headers);
  }
}
