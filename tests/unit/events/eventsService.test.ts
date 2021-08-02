import nock from 'nock';
import { AUTH_BASE, EVENTS_BASE } from '../../../src/constants';
import {
  Client,
  createClient,
  rqlBuilder,
  ParamsOauth2,
} from '../../../src/index';
import { eventInput, eventData } from '../../__helpers__/event';
import { createPagedResponse } from '../../__helpers__/utils';

describe('Events Service', () => {
  const host = 'https://api.xxx.fibricheck.com';
  const eventId = eventData.id;
  const eventsResponse = createPagedResponse(eventData);

  let sdk: Client<ParamsOauth2>;

  beforeAll(async () => {
    sdk = createClient({
      host,
      clientId: '',
    });

    const mockToken = 'mockToken';
    nock(host)
      .post(`${AUTH_BASE}/oauth2/tokens`)
      .reply(200, { access_token: mockToken });

    await sdk.auth.authenticate({
      username: '',
      password: '',
    });
  });

  it('should get a list of events', async () => {
    const rql = rqlBuilder().build();
    nock(`${host}${EVENTS_BASE}`).get(`/${rql}`).reply(200, eventsResponse);

    const res = await sdk.events.find({ rql });

    expect(res.data.length).toBeGreaterThan(0);
  });

  it('should find an event by id', async () => {
    nock(`${host}${EVENTS_BASE}`)
      .get(`/?eq(id,${eventId})`)
      .reply(200, eventsResponse);

    const event = await sdk.events.findById(eventId);

    expect(event.id).toBe(eventId);
  });

  it('should find the first event', async () => {
    nock(`${host}${EVENTS_BASE}`).get('/').reply(200, eventsResponse);

    const event = await sdk.events.findFirst();

    expect(event.id).toBe(eventId);
  });

  it('should create a new event', async () => {
    nock(`${host}${EVENTS_BASE}`).post('/').reply(200, eventData);

    const event = await sdk.events.create(eventInput);

    expect(event.id).toBe(eventData.id);
  });
});
