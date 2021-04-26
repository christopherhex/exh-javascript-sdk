import type { ObjectId } from '../models/ObjectId';
import { PagedResult } from '../models/Responses';

/**
 * Specifies the conditions to be met in order to be able to create a document for a schema
 */
export enum CreateMode {
  DEFAULT = 'default',
  PERMISSION_REQUIRED = 'permissionRequired',
}

/**
 * Specifies the conditions to be met in order to be able to view a document for a schema
 */
export enum ReadMode {
  ALL_USERS = 'allUsers',
  DEFAULT = 'default',
  ENLISTED_IN_LINKED_GROUPS = 'enlistedInLinkedGroups',
}

/**
 * Specifies the conditions to be met in order to be able to update a document for a schema
 */
export enum UpdateMode {
  DEFAULT = 'default',
  CREATOR_ONLY = 'creatorOnly',
  DISABLED = 'disabled',
  LINKED_GROUPS_STAFF_ONLY = 'linkedGroupsStaffOnly',
}

/**
 * Specifies the conditions to be met in order to be able to delete a document for a schema
 */
export enum DeleteMode {
  PERMISSION_REQUIRED = 'permissionRequired',
  LINKED_USERS_ONLY = 'linkedUsersOnly',
}

export enum GroupSyncMode {
  DISABLED = 'disabled',
  CREATOR_PATIENT_ENLISTMENTS = 'creatorPatientEnlistments',
  LINKED_USERS_PATIENT_ENLISTMENTS = 'linkedUsersPatientEnlistments',
}

export enum ConfigurationType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  DATE_TIME = 'date-time',
  DOCUMENT = 'document',
  INPUT = 'input',
}

interface BaseConfiguration {
  queryable?: boolean;
}

export interface ArrayConfiguration extends BaseConfiguration {
  type?: ConfigurationType.ARRAY;
  items?: TypeConfiguration;
  minItems?: number;
  maxItems?: number;
  contains?: TypeConfiguration;
}

export interface ObjectConfiguration extends BaseConfiguration {
  type?: ConfigurationType.OBJECT;
  properties?: Record<string, TypeConfiguration>;
  required?: Array<string>;
}

export interface StringConfiguration extends BaseConfiguration {
  type?: ConfigurationType.STRING;
  minLength?: number;
  maxLength?: number;
  enum?: Array<string>;
  pattern?: string;
  format?: ConfigurationType.DATE_TIME;
}

export interface NumberConfiguration extends BaseConfiguration {
  type?: ConfigurationType.NUMBER;
  minimum?: number;
  maximum?: number;
  enum?: Array<number>;
}

export interface BooleanConfiguration extends BaseConfiguration {
  type?: ConfigurationType.BOOLEAN;
}

export type TypeConfiguration =
  | ObjectConfiguration
  | ArrayConfiguration
  | StringConfiguration
  | NumberConfiguration
  | BooleanConfiguration;

export interface DocumentCondition {
  type?: ConfigurationType.DOCUMENT;
  configuration?: TypeConfiguration;
}

export interface InputCondition {
  type?: ConfigurationType.INPUT;
  configuration?: TypeConfiguration;
}

export enum InitiatorHasRelationToUserInDataConditionType {
  INITIATOR_HAS_RELATION_TO_USER_IN_DATA = 'initiatorHasRelationToUserInData',
}

export enum InitiatorHasRelationToUserInDataConditionRelation {
  IS_STAFF_OF_TARGET_PATIENT = 'isStaffOfTargetPatient',
}

export interface InitiatorHasRelationToUserInDataCondition {
  type?: InitiatorHasRelationToUserInDataConditionType;
  userIdField?: ObjectId;
  relation?: InitiatorHasRelationToUserInDataConditionRelation;
}

export enum InitiatorHasRelationToGroupInDataConditionType {
  INITIATOR_HAS_RELATION_TO_GROUP_IN_DATA = 'initiatorHasRelationToGroupInData',
}

export enum InitiatorHasRelationToGroupInDataConditionRelation {
  STAFF = 'staff',
  PATIENT = 'patient',
}

export interface InitiatorHasRelationToGroupInDataCondition {
  type?: InitiatorHasRelationToGroupInDataConditionType;
  groupIdField?: ObjectId;
  relation?: InitiatorHasRelationToGroupInDataConditionRelation;
  requiredPermission?: string;
}

export type Condition =
  | InputCondition
  | DocumentCondition
  | InitiatorHasRelationToUserInDataCondition
  | InitiatorHasRelationToGroupInDataCondition;

export enum CreationTransitionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export interface CreationTransition {
  toStatus?: string;
  type?: CreationTransitionType;
  conditions?: Array<Condition>;
  actions?: Array<{
    type?:
      | 'algorithm'
      | 'delay'
      | 'task'
      | 'linkCreator'
      | 'linkEnlistedGroups'
      | 'linkUserFromData'
      | 'linkGroupFromData'
      | 'measurementReviewedNotification'
      | 'set'
      | 'unset'
      | 'addItems'
      | 'removeItems';
  }>;
  afterActions?: Array<{
    type?: 'notifyAlgoQueueManager';
  }>;
}

export type StatusData = Record<string, string>;

export interface BaseTransition {
  name?: string;
  fromStatuses?: Array<string>;
}

export type Transition = CreationTransition & BaseTransition;

export interface Schema {
  id?: ObjectId;
  name?: string;
  description?: string;
  properties?: {
    additionalProperties?: TypeConfiguration;
  };
  statuses?: Record<string, StatusData>;
  creationTransition?: CreationTransition;
  transitions?: Array<Transition>;
  createMode?: CreateMode;
  readMode?: ReadMode;
  updateMode?: UpdateMode;
  deleteMode?: DeleteMode;
  groupSyncMode?: GroupSyncMode;
  defaultLimit?: number;
  maximumLimit?: number;
  updateTimestamp?: Date;
  creationTimestamp?: Date;
}

export interface SchemaInput {
  name: string;
  description: string;
  createMode?: CreateMode;
  readMode?: ReadMode;
  updateMode?: UpdateMode;
  deleteMode?: DeleteMode;
  groupSyncMode?: GroupSyncMode;
  defaultLimit?: number;
  maximumLimit?: number;
}

export type UpdateSchemaInput = Pick<
  Partial<SchemaInput>,
  'name' | 'description' | 'defaultLimit' | 'maximumLimit'
>;

export interface SchemasList extends PagedResult {
  data: Array<Schema>;
}