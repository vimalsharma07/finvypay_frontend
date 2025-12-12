// lib/auth-validation.ts
// Advanced user validation utility for authentication flow
// This file now wraps the auth-api service for backward compatibility

import { validateUser as validateUserApi } from './services/auth-api';

export interface UserValidationCredentials {
  email: string;
  password: string;
}

export interface UserValidationResponse {
  success: boolean;
  message: string;
}

export interface UserValidationOptions {
  onSuccess?: (response: UserValidationResponse) => void;
  onError?: (error: string) => void;
}

/**
 * Validates user credentials before login
 * 
 * @param credentials - User email and password
 * @param options - Optional success and error callbacks
 * @returns Promise with validation response
 * 
 * @example
 * ```ts
 * const isValid = await validateUser({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * 
 * if (isValid.success) {
 *   // Proceed with login
 * }
 * ```
 */
export async function validateUser(
  credentials: UserValidationCredentials,
  options?: UserValidationOptions
): Promise<UserValidationResponse> {
  const { email, password } = credentials;

  // Validate input
  if (!email || !email.includes('@')) {
    const errorMsg = 'Please provide a valid email address.';
    options?.onError?.(errorMsg);
    throw new Error(errorMsg);
  }

  if (!password || password.length < 1) {
    const errorMsg = 'Password is required.';
    options?.onError?.(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await validateUserApi({ email, password });

    // Handle successful validation
    if (response.data?.success) {
      const validationResponse: UserValidationResponse = {
        success: true,
        message: response.data?.message || 'User validation successful',
      };
      
      options?.onSuccess?.(validationResponse);
      return validationResponse;
    } else {
      const errorMessage = response.error || 'Validation failed. Please check your credentials.';
      options?.onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'User validation failed. Please check your credentials.';
    options?.onError?.(errorMessage);
    throw new Error(errorMessage);
  }
}

