import { ToastMessagesConfig } from '../types/toast';

export const SUCCESS_MESSAGES = {
  ASSESSMENT_CREATED: 'Assessment created successfully',
  ASSESSMENT_UPDATED: 'Assessment updated successfully',
  CLIENT_CREATED: 'Client created successfully',
  CLIENT_UPDATED: 'Client updated successfully',
  ASSESSMENT_SAVED: 'Assessment saved successfully'
} as const;

export const ERROR_MESSAGES = {
  FAILED_TO_LOAD_ASSESSMENTS: 'Failed to load assessments',
  FAILED_TO_SAVE_ASSESSMENT: 'Failed to save assessment',
  FAILED_TO_LOAD_ASSESSMENT: 'Failed to load assessment',
  VALIDATION_ERRORS: 'Please fix validation errors before submitting',
  FAILED_TO_CREATE_ASSESSMENT: 'Failed to create assessment',
  FAILED_TO_LOAD_CLIENTS: 'Failed to load clients',
  FAILED_TO_SAVE_CLIENT: 'Failed to save client',
  FAILED_TO_LOAD_CLIENT: 'Failed to load client details'
} as const;

export const createSuccessToast = (message: typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES]): ToastMessagesConfig => ({
  message,
  variant: 'success'
});

export const createErrorToast = (message: typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]): ToastMessagesConfig => ({
  message,
  variant: 'error'
});