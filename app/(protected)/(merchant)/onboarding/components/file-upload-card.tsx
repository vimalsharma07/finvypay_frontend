'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { FileUploadType, uploadFile } from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

interface FileUploadCardProps {
  type: FileUploadType;
  label: string;
  description?: string;
  required?: boolean;
  onUploadSuccess?: (filePath: string, s3Id: string, documentType?: FileUploadType) => void;
  onRemove?: () => void;
  disabled?: boolean;
  directorId?: string; // For director document uploads
}

const fileTypeLabels: Record<FileUploadType, string> = {
  identity_proof: 'Identity Proof',
  proof_of_address: 'Proof of Address',
  certificate_of_incorporation: 'Certificate of Incorporation',
  memorandum_of_association: 'Memorandum of Association',
  articles_of_association: 'Articles of Association',
  domain_ownership: 'Domain Ownership',
  register_of_director: 'Register of Director',
  video_kyc: 'Video KYC',
  signed_agreement: 'Signed Agreement',
};

export function FileUploadCard({
  type,
  label,
  description,
  required = false,
  onUploadSuccess,
  onRemove,
  disabled = false,
  directorId,
}: FileUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 FileUploadCard state:', { uploaded, uploadedPath, disabled, uploading });
  }, [uploaded, uploadedPath, disabled, uploading]);

  // If disabled, it means file is already uploaded (from parent state)
  useEffect(() => {
    if (disabled) {
      // When disabled becomes true, show as uploaded
      setUploaded(true);
      setUploadedPath('File already uploaded');
      // Clear any selected file when disabled
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    // IMPORTANT: Don't reset uploaded state when disabled becomes false
    // The uploaded state is managed by handleUpload success handler
    // Only handleRemove() should reset the uploaded state
  }, [disabled]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-upload immediately when file is selected
    setSelectedFile(file);
    setUploaded(false);
    setUploadedPath(null);
    setUploading(true);

    try {
      const response = await uploadFile(file, type, directorId);
      handleApiResponse(response, {
        onSuccess: (data) => {
          // handleApiResponse calls onSuccess with response.data
          // API returns {success: true, message: "..."} 
          // So data = {success: true, message: "..."}
          
          // IMMEDIATELY set uploaded state - don't wait for any conditions!
          // If we got here, the upload was successful (status 200)
          setUploaded(true);
          
          // Get filePath from response if available
          const filePath = data?.data?.filePath || data?.filePath || data?.message || 'File uploaded successfully';
          setUploadedPath(filePath);
          
          // Clear selected file after successful upload
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          toast.success(`${fileTypeLabels[type]} uploaded successfully`);
          
          // Pass filePath, s3Id, and document type to parent callback
          const pathToPass = data?.data?.filePath || data?.filePath || '';
          const s3IdToPass = data?.data?.s3Id || data?.s3Id || '';
          onUploadSuccess?.(pathToPass, s3IdToPass, type);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || `Failed to upload ${fileTypeLabels[type]}`);
          // Reset state on error
          setSelectedFile(null);
          setUploaded(false);
          setUploadedPath(null);
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
          // Reset state on validation error
          setSelectedFile(null);
          setUploaded(false);
          setUploadedPath(null);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('File upload error:', error);
      // Reset state on exception
      setSelectedFile(null);
      setUploaded(false);
      setUploadedPath(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploaded(false);
    setUploadedPath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          {!uploaded ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  disabled={disabled || uploading}
                  className="hidden"
                  id={`file-${type}`}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor={`file-${type}`}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || uploading}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-1" />
                      {uploading ? 'Uploading...' : 'Select & Upload File'}
                    </span>
                  </Button>
                </label>

                {uploading && (
                  <div className="flex-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Uploading file...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">File uploaded successfully</p>
                  {uploadedPath && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {uploadedPath}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

