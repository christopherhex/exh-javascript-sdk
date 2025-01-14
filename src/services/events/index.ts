import type {
  EventsService,
  HttpInstance,
  SubscriptionsService,
} from '../../types';
import httpClient from '../http-client';
import events from './events';
import health from './health';
import subscriptions from './subscriptions';
import { EVENTS_BASE } from '../../constants';
import { decamelizeKeys } from '../../http/utils';

export const eventsService = (
  httpWithAuth: HttpInstance
): ReturnType<typeof health> &
  EventsService & { subscriptions: SubscriptionsService } => {
  const client = httpClient({
    basePath: EVENTS_BASE,
    transformRequestData: decamelizeKeys,
  });

  return {
    ...health(client, httpWithAuth),
    ...events(client, httpWithAuth),
    subscriptions: subscriptions(client, httpWithAuth),
  };
};
