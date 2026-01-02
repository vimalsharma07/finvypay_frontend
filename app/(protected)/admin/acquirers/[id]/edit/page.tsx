'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon, Plug, Save } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getAcquirerById,
  updateAcquirer,
  UpdateAcquirerPayload,
  Acquirer,
} from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { ImageInput, type ImageInputFiles } from '@/components/image-input';
import { uploadFile, deleteFile, deleteFileByPublicId, findFileIdByPublicId } from '@/lib/services/file-upload';

// Form schema
const updateAcquirerSchema = z.object({
  acquirerName: z.string().min(1, 'Acquirer name is required'),
  fileName: z.string().min(1, 'File name is required'),
  iconUrl: z.string().optional(),
  fields: z.array(
    z.object({
      fieldName: z.string().optional(),
      fieldValue: z.string().optional(),
    })
  ),
});

type UpdateAcquirerFormData = z.infer<typeof updateAcquirerSchema>;

export default function EditAcquirerPage() {
  const router = useRouter();
  const params = useParams();
  const acquirerId = params?.id as string;

  const [acquirer, setAcquirer] = useState<Acquirer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [iconFiles, setIconFiles] = useState<ImageInputFiles>([]);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconUrl, setIconUrl] = useState<string>(''); // Store URL for display
  const [iconPublicId, setIconPublicId] = useState<string>(''); // Store publicId separately
  const [iconFileId, setIconFileId] = useState<string>(''); // Store file ID for deletion
  const [originalIconFileId, setOriginalIconFileId] = useState<string>(''); // Store original file ID when loading

  const form = useForm<UpdateAcquirerFormData>({
    resolver: zodResolver(updateAcquirerSchema),
    defaultValues: {
      acquirerName: '',
      fileName: '',
      iconUrl: '',
      fields: [{ fieldName: '', fieldValue: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  // Handle icon upload
  const handleIconChange = async (files: ImageInputFiles) => {
    setIconFiles(files);
    if (files.length > 0 && files[0].file) {
      const file = files[0].file;
      
      // Validate file type - only PNG allowed
      if (file.type !== 'image/png') {
        toast.error('Only PNG files are allowed');
        setIconFiles([]);
        form.setValue('iconUrl', '');
        setIconUrl('');
        setIconPublicId('');
        setIconFileId('');
        return;
      }
      
      // Validate file size - max 2MB
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 2MB');
        setIconFiles([]);
        form.setValue('iconUrl', '');
        setIconUrl('');
        setIconPublicId('');
        setIconFileId('');
        return;
      }
      
      setUploadingIcon(true);
      try {
        // Delete old file if exists (non-blocking - continue even if deletion fails)
        if (originalIconFileId) {
          try {
            await deleteFile(originalIconFileId);
            console.log('Old icon file deleted:', originalIconFileId);
          } catch (deleteError: any) {
            console.warn('Failed to delete old icon file by ID:', deleteError);
            // Try to delete by publicId as fallback
            if (iconPublicId) {
              try {
                await deleteFileByPublicId(iconPublicId);
                console.log('Old icon file deleted by publicId:', iconPublicId);
              } catch (err) {
                console.warn('Failed to delete old icon file by publicId:', err);
              }
            }
            // Continue with upload even if delete fails - don't block the upload
          }
        } else if (iconPublicId) {
          // Try to delete by publicId if we don't have the file ID
          try {
            await deleteFileByPublicId(iconPublicId);
            console.log('Old icon file deleted by publicId:', iconPublicId);
          } catch (deleteError: any) {
            console.warn('Failed to delete old icon file:', deleteError);
            // Continue with upload even if delete fails - don't block the upload
          }
        }

        const uploadResponse = await uploadFile(file, 'Acquirer icon', 'common');
        // Store publicId in the form (for database)
        form.setValue('iconUrl', uploadResponse.publicId, { shouldValidate: false, shouldDirty: true });
        // Store publicId separately to ensure it's included in payload
        setIconPublicId(uploadResponse.publicId);
        // Store file ID for future deletion
        setIconFileId(uploadResponse.id);
        // Store URL for display
        setIconUrl(uploadResponse.url);
        console.log('Icon uploaded, publicId:', uploadResponse.publicId, 'fileId:', uploadResponse.id);
        console.log('Form iconUrl value:', form.getValues('iconUrl'));
        toast.success('Icon uploaded successfully');
      } catch (error) {
        console.error('Error uploading icon:', error);
        toast.error('Failed to upload icon. Please try again.');
        setIconFiles([]);
        form.setValue('iconUrl', '');
        setIconUrl('');
        setIconPublicId('');
        setIconFileId('');
      } finally {
        setUploadingIcon(false);
      }
    } else {
      form.setValue('iconUrl', '');
      setIconUrl('');
      setIconPublicId('');
    }
  };

  // Fetch acquirer on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!acquirerId) {
        toast.error('Acquirer ID is missing');
        router.push('/admin/acquirers');
        return;
      }

      setLoading(true);
      try {
        const response = await getAcquirerById(acquirerId);

        handleApiResponse<Acquirer>(response, {
          onSuccess: (acquirerData) => {
            if (acquirerData) {
              setAcquirer(acquirerData);

              // Convert fields object to array format
              const fieldsArray = Object.entries(acquirerData.fields || {}).map(
                ([fieldName, fieldValue]) => ({
                  fieldName,
                  fieldValue: String(fieldValue || ''),
                })
              );

              // If no fields, show one empty field
              const formFields = fieldsArray.length > 0 
                ? fieldsArray 
                : [{ fieldName: '', fieldValue: '' }];

              // Populate form with acquirer data
              const formData = {
                acquirerName: acquirerData.acquirerName || '',
                fileName: acquirerData.fileName || '',
                iconUrl: acquirerData.iconUrl || '',
                fields: formFields,
              };

              // Reset form with all data
              form.reset(formData);
              
              // Replace field array to ensure proper rendering
              replace(formFields);
              
              // Set icon URL for display if iconUrl exists
              if (acquirerData.iconUrl) {
                // If it's a publicId, construct URL; if it's already a URL, use it
                if (acquirerData.iconUrl.startsWith('uploads/')) {
                  setIconUrl(`https://stagebucket4all.s3.amazonaws.com/${acquirerData.iconUrl}`);
                  setIconPublicId(acquirerData.iconUrl);
                  // Find and store the file ID for deletion
                  findFileIdByPublicId(acquirerData.iconUrl).then(fileId => {
                    if (fileId) {
                      setIconFileId(fileId);
                      setOriginalIconFileId(fileId);
                    }
                  });
                } else if (acquirerData.iconUrl.startsWith('http://') || acquirerData.iconUrl.startsWith('https://')) {
                  setIconUrl(acquirerData.iconUrl);
                } else {
                  // Assume it's a publicId
                  setIconPublicId(acquirerData.iconUrl);
                  // Find and store the file ID for deletion
                  findFileIdByPublicId(acquirerData.iconUrl).then(fileId => {
                    if (fileId) {
                      setIconFileId(fileId);
                      setOriginalIconFileId(fileId);
                    }
                  });
                }
              }
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load acquirer');
            router.push('/admin/acquirers');
          },
        });
      } catch (error) {
        console.error('Error fetching acquirer:', error);
        toast.error('An error occurred while loading acquirer');
        router.push('/admin/acquirers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acquirerId, router]);

  const onSubmit = async (data: UpdateAcquirerFormData) => {
    if (!acquirerId) {
      toast.error('Acquirer ID is missing');
      return;
    }

    setSubmitting(true);
    try {
      // Convert fields array to object format (only include non-empty fields)
      const fieldsObject: Record<string, string> = {};
      data.fields?.forEach((field) => {
        if (field.fieldName?.trim() && field.fieldValue?.trim()) {
          fieldsObject[field.fieldName.trim()] = field.fieldValue.trim();
        }
      });

      // Get iconUrl from state (publicId from upload) - use state as primary source
      const finalIconPublicId = iconPublicId?.trim() || data.iconUrl?.trim() || form.getValues('iconUrl')?.trim();

      // If icon was removed (empty but we had an original), delete the old file (non-blocking)
      if (!finalIconPublicId && originalIconFileId) {
        try {
          await deleteFile(originalIconFileId);
          console.log('Old icon file deleted on update:', originalIconFileId);
        } catch (error: any) {
          console.warn('Failed to delete old icon file on update:', error);
          // Try deleting by publicId as fallback
          if (iconPublicId) {
            try {
              await deleteFileByPublicId(iconPublicId);
            } catch (err) {
              console.warn('Failed to delete old icon file by publicId:', err);
            }
          }
          // Continue with update even if delete fails - don't block the update
        }
      }

      const payload: UpdateAcquirerPayload = {
        acquirerName: data.acquirerName.trim(),
        fileName: data.fileName.trim(),
        ...(finalIconPublicId && finalIconPublicId.length > 0 && { iconUrl: finalIconPublicId }),
        fields: fieldsObject,
      };

      const response = await updateAcquirer(acquirerId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer updated successfully!');
          router.push('/admin/acquirers');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update acquirer');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      console.error('❌ Error updating acquirer:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Edit Acquirer"
              description="Update payment gateway acquirer details including name, configuration settings, and integration parameters"
              icon={Plug}
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading acquirer data...</p>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!acquirer) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Edit Acquirer"
              description="Update payment gateway acquirer details including name, configuration settings, and integration parameters"
              icon={Plug}
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Acquirer not found</p>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/acquirers')}
                className="mt-4"
              >
                Back to Acquirers
              </Button>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Edit Acquirer"
            description="Update acquirer details"
          />
          <div className="flex items-center">
            <Link
              href="/admin/acquirers"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="acquirerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Acquirer Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Acquirer Name"
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        File Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter File Name"
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Icon Upload Section */}
              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Acquirer Icon <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <ImageInput
                        value={iconFiles}
                        onChange={handleIconChange}
                        acceptType={['image/png']}
                        multiple={false}
                      >
                        {({ onImageUpload, fileList, onImageRemove, isDragging, dragProps }) => (
                          <div className="space-y-3">
                            {fileList.length > 0 || iconUrl ? (
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="h-20 w-20 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                                    {iconUrl ? (
                                      <img
                                        src={iconUrl}
                                        alt="Acquirer icon"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/media/app/pay4tech.png';
                                        }}
                                      />
                                    ) : fileList[0]?.dataURL ? (
                                      <img
                                        src={fileList[0].dataURL}
                                        alt="Acquirer icon"
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <img
                                        src="/media/app/pay4tech.png"
                                        alt="Default acquirer icon"
                                        className="h-full w-full object-cover opacity-50"
                                      />
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={async () => {
                                      // Delete file from database and S3 if exists (non-blocking)
                                      const fileIdToDelete = iconFileId || originalIconFileId;
                                      let deletionSuccess = false;
                                      
                                      if (fileIdToDelete) {
                                        try {
                                          await deleteFile(fileIdToDelete);
                                          console.log('Icon file deleted:', fileIdToDelete);
                                          deletionSuccess = true;
                                        } catch (error: any) {
                                          console.warn('Error deleting icon file by ID:', error);
                                          // Try deleting by publicId as fallback
                                          if (iconPublicId) {
                                            try {
                                              await deleteFileByPublicId(iconPublicId);
                                              console.log('Icon file deleted by publicId:', iconPublicId);
                                              deletionSuccess = true;
                                            } catch (err) {
                                              console.warn('Error deleting icon file by publicId:', err);
                                            }
                                          }
                                        }
                                      } else if (iconPublicId) {
                                        // Try to delete by publicId if we don't have file ID
                                        try {
                                          await deleteFileByPublicId(iconPublicId);
                                          console.log('Icon file deleted by publicId:', iconPublicId);
                                          deletionSuccess = true;
                                        } catch (error) {
                                          console.warn('Error deleting icon file by publicId:', error);
                                        }
                                      }
                                      
                                      // Always remove from UI, even if file deletion failed
                                      onImageRemove(0);
                                      setIconFiles([]);
                                      form.setValue('iconUrl', '');
                                      setIconUrl('');
                                      setIconPublicId('');
                                      setIconFileId('');
                                      setOriginalIconFileId('');
                                      
                                      if (deletionSuccess) {
                                        toast.success('Icon removed successfully');
                                      } else {
                                        toast.warning('Icon removed from form, but file deletion may have failed. Please check manually.');
                                      }
                                    }}
                                    disabled={uploadingIcon || submitting}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{fileList[0]?.file?.name || 'Icon uploaded'}</p>
                                  {uploadingIcon && (
                                    <p className="text-xs text-muted-foreground">Uploading...</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                {...dragProps}
                                onClick={onImageUpload}
                                className={`
                                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                                  ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                                  ${uploadingIcon || submitting ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                              >
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium mb-1">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG only, up to 2MB
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </ImageInput>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden field for iconUrl to ensure it's included in form submission */}
              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fields Section */}
              <div className="space-y-4">
                <FormLabel>Fields: <span className="text-muted-foreground font-normal text-sm">(Optional)</span></FormLabel>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3">
                      <FormField
                        control={form.control}
                        name={`fields.${index}.fieldName`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="sr-only">Field Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Field Name"
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`fields.${index}.fieldValue`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="sr-only">Field Value</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Field Value"
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-0 shrink-0"
                          onClick={() => remove(index)}
                          disabled={submitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ fieldName: '', fieldValue: '' })}
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/acquirers')}
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  <Save className="h-4 w-4" />
                  {submitting ? 'Updating...' : 'Update Acquirer'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

