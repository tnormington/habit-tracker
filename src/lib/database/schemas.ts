/**
 * RxDB Schemas
 * JSON Schema definitions for database collections
 */

import type { RxJsonSchema } from 'rxdb';
import type { HabitDocType, HabitCompletionDocType } from './types';

export const habitSchema: RxJsonSchema<HabitDocType> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
      maxLength: 200,
    },
    description: {
      type: 'string',
      maxLength: 1000,
    },
    frequency: {
      type: 'string',
      enum: ['daily', 'weekly', 'monthly'],
    },
    targetCount: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
    },
    color: {
      type: 'string',
      maxLength: 50,
    },
    icon: {
      type: 'string',
      maxLength: 100,
    },
    createdAt: {
      type: 'integer',
      minimum: 0,
      maximum: 9999999999999,
    },
    updatedAt: {
      type: 'integer',
      minimum: 0,
      maximum: 9999999999999,
    },
    isArchived: {
      type: 'boolean',
    },
  },
  required: [
    'id',
    'name',
    'description',
    'frequency',
    'targetCount',
    'color',
    'icon',
    'createdAt',
    'updatedAt',
    'isArchived',
  ],
  indexes: ['createdAt', 'isArchived'],
};

export const habitCompletionSchema: RxJsonSchema<HabitCompletionDocType> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    habitId: {
      type: 'string',
      maxLength: 100,
    },
    completedAt: {
      type: 'integer',
      minimum: 0,
      maximum: 9999999999999,
    },
    count: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
    },
    notes: {
      type: 'string',
      maxLength: 500,
    },
  },
  required: ['id', 'habitId', 'completedAt', 'count', 'notes'],
  indexes: ['habitId', 'completedAt'],
};
