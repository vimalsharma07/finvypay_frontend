import { apiFetch, ApiError } from '../api';

export interface FileUploadResponse {
  success: boolean;
  data: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    publicId: string;
    description?: string;
    type: string;
    uploader?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    createdAt: string;
  };
}

/**
 * Upload a file to the backend
 * @param file - The file to upload
 * @param description - Optional description
 * @param type - Optional file type (common, support, passport)
 * @returns Promise with file upload response containing publicId and url
 */
export async function uploadFile(
  file: File,
  description?: string,
  type?: string
): Promise<FileUploadResponse['data']> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (description) {
    formData.append('description', description);
  }
  
  if (type) {
    formData.append('type', type);
  }

  try {
    // Use json: true but manually handle headers to allow FormData
    const response = await apiFetch('/file-upload', 'POST', {
      json: true, // Parse JSON response
      body: formData,
      auth: true,
      headers: {}, // Don't set Content-Type - let browser set it for FormData
    });

    console.log('File upload response:', response);

    // apiFetch returns the data directly on success, or throws ApiError on failure
    // So if we get here, it's a successful response
    const data = response;

    // Handle different response structures
    if (typeof data === 'object' && data !== null) {
      // If data has success and data properties (wrapped response: { success: true, data: {...} })
      if ('success' in data && data.success && 'data' in data && data.data) {
        return data.data as FileUploadResponse['data'];
      }
      // If data is directly the file data (unwrapped response with file properties)
      if ('publicId' in data && 'url' in data && 'id' in data) {
        return data as unknown as FileUploadResponse['data'];
      }
      // If data has a data property that contains the file
      if ('data' in data && data.data && typeof data.data === 'object' && 'publicId' in data.data) {
        return data.data as FileUploadResponse['data'];
      }
    }
    
    console.error('Unexpected response structure:', data);
    throw new Error('Invalid response structure from server. Expected file data but got: ' + JSON.stringify(data));
  } catch (error: any) {
    console.error('File upload exception:', error);
    
    // Handle ApiError from apiFetch
    if (error instanceof ApiError) {
      const errorMessage = error.message || error.data?.message || error.data?.error || `HTTP Error: ${error.status}`;
      throw new Error(errorMessage);
    }
    
    // Handle regular Error
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle other error types
    const errorMessage = error?.message || error?.error || String(error) || 'Failed to upload file';
    throw new Error(errorMessage);
  }
}

/**
 * Get all files (used to find file by publicId)
 * @returns Promise with array of files
 */
export async function getAllFiles(): Promise<FileUploadResponse['data'][]> {
  try {
    const response = await apiFetch('/file-upload', 'GET', {
      json: true,
      auth: false, // Public endpoint
    });

    // Handle different response structures
    if (Array.isArray(response)) {
      return response as FileUploadResponse['data'][];
    }
    
    if (typeof response === 'object' && response !== null && 'data' in response && Array.isArray(response.data)) {
      return response.data as FileUploadResponse['data'][];
    }

    return [];
  } catch (error: any) {
    console.error('Get files exception:', error);
    return [];
  }
}

/**
 * Find file ID by publicId
 * @param publicId - The publicId to search for
 * @returns Promise with file ID or null if not found
 */
export async function findFileIdByPublicId(publicId: string): Promise<string | null> {
  try {
    const files = await getAllFiles();
    const file = files.find(f => f.publicId === publicId);
    return file?.id || null;
  } catch (error) {
    console.error('Error finding file by publicId:', error);
    return null;
  }
}

/**
 * Delete a file from the backend (removes from database and S3)
 * @param fileId - The file ID (UUID) to delete
 * @returns Promise that resolves when file is deleted
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const response = await apiFetch(`/file-upload/${fileId}`, 'DELETE', {
      json: true,
      auth: true,
    });
    
    // Check if deletion was successful
    if (response && typeof response === 'object' && 'message' in response) {
      console.log('File deleted successfully:', fileId);
      return;
    }
    
    // If response doesn't have expected structure, still consider it successful
    // (some APIs return empty response or different structure)
    console.log('File deletion completed:', fileId);
  } catch (error: any) {
    console.error('File delete exception:', error);
    
    // Handle ApiError from apiFetch
    if (error instanceof ApiError) {
      // If it's a 404, the file might already be deleted - that's okay
      if (error.status === 404) {
        console.warn('File not found (may already be deleted):', fileId);
        return; // Don't throw error for 404
      }
      
      // If it's a 403, user might not have permission - log but don't block
      if (error.status === 403) {
        console.warn('Permission denied for file deletion:', fileId);
        throw new Error('Permission denied. Admin role required to delete files.');
      }
      
      const errorMessage = error.message || error.data?.message || `HTTP Error: ${error.status}`;
      throw new Error(errorMessage);
    }
    
    // Handle regular Error
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle other error types
    const errorMessage = error?.message || error?.error || String(error) || 'Failed to delete file';
    throw new Error(errorMessage);
  }
}

/**
 * Delete a file by publicId (finds the file ID first, then deletes)
 * @param publicId - The publicId to delete
 * @returns Promise that resolves when file is deleted
 */
export async function deleteFileByPublicId(publicId: string): Promise<void> {
  const fileId = await findFileIdByPublicId(publicId);
  if (fileId) {
    await deleteFile(fileId);
  } else {
    console.warn('File not found for publicId:', publicId);
  }
}

