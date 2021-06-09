import nock from 'nock';
import { AUTH_BASE, DATA_BASE } from '../../../src/constants';
import { Client, createClient, ParamsOauth2 } from '../../../src/index';
import {
  newSchemaInput,
  newSchemaCreated,
  schemasListResponse,
} from '../../__helpers__/data';

describe('Schemas Service', () => {
  const schemaId = newSchemaCreated.id;
  const host = 'https://api.xxx.fibricheck.com';
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

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should create a schema', async () => {
    nock(`${host}${DATA_BASE}`).post('/').reply(200, newSchemaCreated);
    const schema = await sdk.data.schemas.create(newSchemaInput);
    expect(schema.creationTransition).toBeDefined();
  });

  it('should request a list of schemas', async () => {
    nock(`${host}${DATA_BASE}`).get('/').reply(200, schemasListResponse);
    const res = await sdk.data.schemas.find();
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('should update a schema', async () => {
    const newSchemaData = { name: 'schemaA', description: 'schema desc' };
    nock(`${host}${DATA_BASE}`).put(`/${schemaId}`).reply(200, {
      affectedRecords: 1,
    });
    const res = await sdk.data.schemas.update(schemaId, newSchemaData);
    expect(res.affectedRecords).toBe(1);
  });

  it('should delete a schema', async () => {
    nock(`${host}${DATA_BASE}`).delete(`/${schemaId}`).reply(200, {
      affectedRecords: 1,
    });
    const res = await sdk.data.schemas.delete(schemaId);
    expect(res.affectedRecords).toBe(1);
  });

  it('should disable a schema', async () => {
    nock(`${host}${DATA_BASE}`).post(`/${schemaId}/disable`).reply(200, {
      affectedRecords: 1,
    });
    const res = await sdk.data.schemas.disable(schemaId);
    expect(res.affectedRecords).toBe(1);
  });

  it('should enable a schema', async () => {
    nock(`${host}${DATA_BASE}`).post(`/${schemaId}/enable`).reply(200, {
      affectedRecords: 1,
    });
    const res = await sdk.data.schemas.enable(schemaId);
    expect(res.affectedRecords).toBe(1);
  });

  it('should find a transition by name given a schema', async () => {
    nock(`${host}${DATA_BASE}`).get('/').reply(200, schemasListResponse);
    const {
      data: [schema],
    } = await sdk.data.schemas.find();
    const transition = schema.transitionByName('move');
    expect(transition.name).toBe('move');
  });
});
