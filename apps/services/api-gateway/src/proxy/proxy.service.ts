import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { Request, Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

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
      this.logger.error(
        `[Proxy Error] ${req.method} ${req.url} -> ${url}`,
        error,
      );

      if (error.response) {
        // Forward the exact error from the backend service
        const status = error.response.status || 500;
        const errorData = error.response.data || {};

        res.status(status).json({
          success: false,
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: req.url,
          method: req.method,
          error: errorData.error || errorData.message || 'Service Error',
          message:
            errorData.message ||
            errorData.error ||
            'An error occurred in the service',
          details: errorData.details || errorData,
        });
      } else if (error.request) {
        // Request was made but no response received (service is down)
        res.status(503).json({
          success: false,
          statusCode: 503,
          timestamp: new Date().toISOString(),
          path: req.url,
          method: req.method,
          error: 'Service Unavailable',
          message: `Unable to connect to service at ${serviceUrl}`,
        });
      } else {
        // Something else happened
        res.status(500).json({
          success: false,
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: req.url,
          method: req.method,
          error: 'Gateway Error',
          message: error.message || 'Internal server error',
        });
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
      this.handleProxyError(error, url, method);
    }
  }

  private handleProxyError(error: any, url: string, method: string): never {
    if (error.response) {
      const axiosError = error as AxiosError;
      const status =
        axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const data: any = axiosError.response?.data || {};

      this.logger.error(
        `[Proxy Error] ${method} ${url} - Status: ${status} - ${JSON.stringify(data)}`,
      );

      // Forward the exact error from the backend service
      throw new HttpException(
        {
          success: false,
          statusCode: status,
          timestamp: new Date().toISOString(),
          error: data.error || data.message || 'Service Error',
          message:
            data.message || data.error || 'An error occurred in the service',
          details: data.details || data,
        },
        status,
      );
    } else if (error.request) {
      // Request was made but no response received (service is down)
      this.logger.error(`[Proxy Error] ${method} ${url} - Service unavailable`);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          timestamp: new Date().toISOString(),
          error: 'Service Unavailable',
          message: `Unable to connect to service at ${url}`,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      // Something else happened
      this.logger.error(`[Proxy Error] ${method} ${url} - ${error.message}`);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          error: 'Gateway Error',
          message: error.message || 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
