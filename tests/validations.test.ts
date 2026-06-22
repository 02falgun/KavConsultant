import { describe, it, expect } from 'vitest';
import {
  uuidSchema,
  updateApplicationStageSchema,
  studentFormSchema,
  applicationFormSchema,
  taskFormSchema,
} from '@/lib/validations/workflow';

describe('Zod Validation Schemas', () => {
  describe('uuidSchema', () => {
    it('should validate correct UUID formats', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = uuidSchema.safeParse(validUuid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID formats', () => {
      const invalidUuid = 'not-a-valid-uuid';
      const result = uuidSchema.safeParse(invalidUuid);
      expect(result.success).toBe(false);
    });
  });

  describe('studentFormSchema', () => {
    it('should pass on valid student fields', () => {
      const validData = {
        fullName: 'Jane Doe',
        email: 'janedoe@email.com',
        phone: '+123456789',
        source: 'organic',
        leadScore: 85,
        tags: ['visa', 'priority'],
      };
      const result = studentFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when fullName is too short', () => {
      const invalidData = {
        fullName: 'J',
        source: 'organic',
      };
      const result = studentFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail on invalid email structures', () => {
      const invalidData = {
        fullName: 'Jane Doe',
        email: 'invalid-email-address',
        source: 'organic',
      };
      const result = studentFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('applicationFormSchema', () => {
    it('should pass on valid applications fields', () => {
      const validData = {
        studentId: '123e4567-e89b-12d3-a456-426614174000',
        universityId: '123e4567-e89b-12d3-a456-426614174001',
        programId: '123e4567-e89b-12d3-a456-426614174002',
        applicationNumber: 'APP-2026-X',
        stage: 'NEW',
      };
      const result = applicationFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pipeline stages', () => {
      const invalidData = {
        studentId: '123e4567-e89b-12d3-a456-426614174000',
        universityId: '123e4567-e89b-12d3-a456-426614174001',
        programId: '123e4567-e89b-12d3-a456-426614174002',
        applicationNumber: 'APP-2026-X',
        stage: 'invalid_stage_name',
      };
      const result = applicationFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('taskFormSchema', () => {
    it('should pass on valid tasks', () => {
      const validData = {
        title: 'Review Application Docs',
        status: 'open',
        priority: 'high',
      };
      const result = taskFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when title is missing', () => {
      const invalidData = {
        status: 'open',
        priority: 'high',
      };
      const result = taskFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
