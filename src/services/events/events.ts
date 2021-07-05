import type { HttpInstance } from '../../types';
import { PagedResult, ObjectId } from '../types';
import { RQLString, rqlBuilder } from '../../rql';
import type { CreateEvent, Event, EventsService } from './types';

export default (client, httpAuth: HttpInstance): EventsService => ({
  /**
   * Returns a list of events
   * Permission | Scope | Effect
   * - | - | -
   * `VIEW_EVENTS` | `global` | **Required** for this endpoint
   *
   * @param rql Add filters to the requested list.
   * @returns PagedResult<Event>
   */
  async find(options?: { rql?: RQLString }): Promise<PagedResult<Event>> {
    return (await client.get(httpAuth, `/${options?.rql || ''}`)).data;
  },

  /**
   * Find By Id
   * @param id the Id to search for
   * @param rql an optional rql string
   * @returns the first element found
   */
  async findById(id: ObjectId, options?: { rql?: RQLString }): Promise<Event> {
    const rqlWithId = rqlBuilder(options?.rql).eq('id', id).build();
    const res = await this.find({ rql: rqlWithId });
    return res.data[0];
  },

  /**
   * Find First
   * @param rql an optional rql string
   * @returns the first element found
   */
  async findFirst(options?: { rql?: RQLString }): Promise<Event> {
    const res = await this.find(options);
    return res.data[0];
  },

  /**
   * Creates an event
   * Permission | Scope | Effect
   * - | - | -
   * `CREATE_EVENTS` | `global` | **Required** for this endpoint
   *
   * @param requestBody
   * @returns Event
   */
  async create(requestBody: CreateEvent): Promise<Event> {
    return (await client.post(httpAuth, '/', requestBody)).data;
  },
});
