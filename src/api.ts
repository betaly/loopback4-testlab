import {MetadataInspector} from '@loopback/metadata';
import {RestEndpoint} from '@loopback/openapi-v3';
import {OAI3Keys} from '@loopback/openapi-v3/dist/keys';
import {Client, supertest} from '@loopback/testlab';
import {PickProperties} from 'ts-essentials';

import {AnyClass} from './types.internal';

export type ControllerApiNames<T> = keyof PickProperties<T, Function>;
export type ControllerApiFn = (params?: Record<string, any>) => supertest.Test;
export type ControllerApi<T> = Record<ControllerApiNames<T>, ControllerApiFn>;

export type RequestHook = (req: supertest.Test) => supertest.Test;

export function buildApiFromController<T>(
  client: Client,
  controllerClass: AnyClass<T>,
  hooks?: Partial<Record<keyof T, RequestHook>>,
): ControllerApi<T> {
  const methods = Object.getOwnPropertyNames(controllerClass.prototype).filter(name => {
    return typeof controllerClass.prototype[name] === 'function' && name !== 'constructor';
  }) as ControllerApiNames<T>[];

  const api: ControllerApi<T> = {} as any;
  for (const method of methods) {
    const endpoint = MetadataInspector.getMethodMetadata<RestEndpoint>(
      OAI3Keys.METHODS_KEY,
      controllerClass.prototype,
      method as string,
    );
    if (endpoint) {
      const hook = hooks?.[method as keyof T] ?? (req => req);
      const request = buildApiFn(client, endpoint.verb as any, endpoint.path);
      api[method] = (params?: Record<string, string>) => hook(request(params));
    }
  }
  return api;
}

function buildApiFn(
  client: Client,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'del',
  url: string,
): ControllerApiFn {
  return (params?: Record<string, any>) => {
    url = url.replace(/{([^}]*)}/g, (_, key) => {
      const v = params?.[key];
      if (!v) {
        throw new Error(`Missing parameter "${key}"`);
      }
      return v;
    });
    return client[method](url);
  };
}
