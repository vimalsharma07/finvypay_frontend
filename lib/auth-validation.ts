// lib/auth-validation.ts
// Advanced user validation utility for authentication flow

import { http, ApiError } from './api';

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
    const response = await http.post(
      '/auth/validation',
      {
        email,
        password,
      },
      {
        auth: false, // Don't send auth token for validation
      }
    ) as UserValidationResponse;

    // Handle successful validation
    if (response?.success) {
      const validationResponse: UserValidationResponse = {
        success: true,
        message: response?.message || 'User validation successful',
      };
      
      options?.onSuccess?.(validationResponse);
      return validationResponse;
    } else {
      throw new Error('Validation failed. Please check your credentials.');
    }
  } catch (err) {
    let errorMessage = 'User validation failed. Please check your credentials.';
    
    if (err instanceof ApiError) {
      errorMessage = 
        err.data?.message || 
        err.data?.error || 
        err.message || 
        errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    options?.onError?.(errorMessage);
    throw new Error(errorMessage);
  }
}

