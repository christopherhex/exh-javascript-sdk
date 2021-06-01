import type { HttpInstance } from '../../types';
import httpClient from '../http-client';
import health from './health';
import products from './products';
import orders from './orders';
import subscriptions from './subscriptions';
import appStore from './appStore';
import appStoreSubscriptions from './appStoreSubscriptions';
import stripe from './stripe';
import { PAYMENTS_BASE } from '../../constants';

export type PaymentsService = ReturnType<typeof health> & {
  products: ReturnType<typeof products>;
  orders: ReturnType<typeof orders>;
  subscriptions: ReturnType<typeof subscriptions>;
  appStore: ReturnType<typeof appStore>;
  appStoreSubscriptions: ReturnType<typeof appStoreSubscriptions>;
  stripe: ReturnType<typeof stripe>;
};

export const paymentsService = (
  httpWithAuth: HttpInstance
): PaymentsService => {
  const client = httpClient({
    basePath: PAYMENTS_BASE,
  });

  return {
    ...health(client, httpWithAuth),
    products: products(client, httpWithAuth),
    orders: orders(client, httpWithAuth),
    subscriptions: subscriptions(client, httpWithAuth),
    appStore: appStore(client, httpWithAuth),
    appStoreSubscriptions: appStoreSubscriptions(client, httpWithAuth),
    stripe: stripe(client, httpWithAuth),
  };
};
