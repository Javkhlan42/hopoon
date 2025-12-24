import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { Request, Response } from 'express';

@Injectable()
export class ProxyService {
  constructor(private httpService: HttpService) {}

  async proxy(
    req: Request,
    res: Response,
    serviceUrl: string,
    controllerPrefix?: string,
  ): Promise<void> {
    // Separate path from query string
    const [pathPart, queryPart] = req.url.split('?');
    let path = pathPart;

    console.log(`[Proxy Debug] Original URL: ${req.url}`);
    console.log(
      `[Proxy Debug] Path part: ${pathPart}, Query part: ${queryPart}`,
    );

    // Remove /api/v1 prefix if exists
    if (path.startsWith('/api/v1')) {
      path = path.replace('/api/v1', '');
      console.log(`[Proxy Debug] After removing /api/v1: ${path}`);
    }

    // Remove controller prefix if provided (e.g., /payments -> /)
    if (controllerPrefix && path.startsWith(`/${controllerPrefix}`)) {
      path = path.replace(`/${controllerPrefix}`, '');
      console.log(`[Proxy Debug] After removing /${controllerPrefix}: ${path}`);
    }

    // Reconstruct URL with query string
    const fullPath = queryPart ? `${path}?${queryPart}` : path;
    const url = `${serviceUrl}${fullPath}`;

    console.log(`[Proxy] ${req.method} ${req.url} -> ${url}`);

    const config: AxiosRequestConfig = {
      method: req.method,
      url,
      headers: {
        ...req.headers,
        host: new URL(serviceUrl).host,
      },
    };

    // Forward body for POST, PUT, PATCH
    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      config.data = req.body;
    }

    // Query params are already in the URL, no need to add them again via config.params

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res
          .status(500)
          .json({ message: 'Internal server error', error: error.message });
      }
    }
  }

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
