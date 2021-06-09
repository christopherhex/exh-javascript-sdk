import type { HttpInstance } from '../../types';
import type { ObjectId, AffectedRecords, PagedResult } from '../types';
import type { Task, TaskInput } from './types';
import { RQLString, rqlBuilder } from '../../rql';

export default (client, httpAuth: HttpInstance) => ({
  /**
   * View a list of tasks
   * Permission | Scope | Effect
   * - | - | -
   * `VIEW_TASKS` | `gobal` | **Required** for this endpoint
   *
   * @returns any Success
   */
  async find(options?: { rql?: RQLString }): Promise<PagedResult<Task>> {
    return (await client.get(httpAuth, `/${options?.rql || ''}`)).data;
  },

  /**
   * Find By Id
   * @param id the Id to search for
   * @param rql an optional rql string
   * @returns the first element found
   */
  async findById(id: ObjectId, options?: { rql?: RQLString }): Promise<Task> {
    const rqlWithId = rqlBuilder(options?.rql).eq('id', id).build();
    const res = await this.find({ rql: rqlWithId });
    return res.data[0];
  },

  /**
   * Find First
   * @param rql an optional rql string
   * @returns the first element found
   */
  async findFirst(options?: { rql?: RQLString }): Promise<Task> {
    const res = await this.find(options);
    return res.data[0];
  },

  /**
   * Create a task
   * Permission | Scope | Effect
   * - | - | -
   * `CREATE_TASKS` | `gobal` | **Required** for this endpoint
   *
   * @param requestBody
   * @returns Task Success
   */
  async create(requestBody: TaskInput): Promise<Task> {
    return (await client.post(httpAuth, '/', requestBody)).data;
  },

  /**
   * Cancel a task
   * The targeted task **MUST** be in the `new` status.
   *
   * Permission | Scope | Effect
   * - | - | -
   * `CANCEL_TASKS` | `gobal` | **Required** for this endpoint
   *
   * @param taskId The id of the targeted task
   * @returns any Operation successful
   * @throws {IllegalStateException}
   * @throws {ResourceUnknownException}
   */
  async cancel(taskId: ObjectId): Promise<AffectedRecords> {
    return (await client.post(httpAuth, `/${taskId}/cancel`)).data;
  },
});
