'use client';

import { Fragment, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAcquirer, CreateAcquirerPayload } from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { ImageInput, type ImageInputFiles } from '@/components/image-input';
import { uploadToS3 } from '@/lib/s3-upload';

// Available provider types
const PROVIDER_TYPES = [
  { value: 'test-gateway.provider.ts', label: 'TestGateway', description: 'Test Provider for sandbox testing' },
  { value: 'cardserv.provider.ts', label: 'CardServ', description: 'CardServ payment provider' },
] as const;

// Form schema
const createAcquirerSchema = z.object({
  acquirerName: z.string().min(1, 'Acquirer name is required'),
  providerType: z.string().min(1, 'Provider type is required'),
  fileName: z.string().min(1, 'File name is required'),
  iconUrl: z.string().optional(),
  fields: z.array(
    z.object({
      fieldName: z.string().optional(),
      fieldValue: z.string().optional(),
    })
  ),
});

type CreateAcquirerFormData = z.infer<typeof createAcquirerSchema>;

export default function CreateAcquirerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [iconFiles, setIconFiles] = useState<ImageInputFiles>([]);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const form = useForm<CreateAcquirerFormData>({
    resolver: zodResolver(createAcquirerSchema),
    defaultValues: {
      acquirerName: '',
      providerType: '',
      fileName: '',
      iconUrl: '',
      fields: [{ fieldName: '', fieldValue: '' }],
    },
  });

  // Watch providerType to auto-fill fileName
  const selectedProviderType = form.watch('providerType');
  
  useEffect(() => {
    if (selectedProviderType) {
      const provider = PROVIDER_TYPES.find(p => p.value === selectedProviderType);
      if (provider) {
        form.setValue('fileName', provider.value);
        // Auto-fill acquirer name if empty
        if (!form.getValues('acquirerName')) {
          form.setValue('acquirerName', provider.label);
        }
      }
    }
  }, [selectedProviderType, form]);

  const { fields, append, remove } = useFieldArray({
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
        return;
      }
      
      // Validate file size - max 2MB
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 2MB');
        setIconFiles([]);
        form.setValue('iconUrl', '');
        return;
      }
      
      setUploadingIcon(true);
      try {
        const iconUrl = await uploadToS3(file, 'acquirer-icons');
        form.setValue('iconUrl', iconUrl);
        toast.success('Icon uploaded successfully');
      } catch (error) {
        console.error('Error uploading icon:', error);
        toast.error('Failed to upload icon. Please check your S3 configuration.');
        setIconFiles([]);
        form.setValue('iconUrl', '');
      } finally {
        setUploadingIcon(false);
      }
    } else {
      form.setValue('iconUrl', '');
    }
  };

  const onSubmit = async (data: CreateAcquirerFormData) => {
    setSubmitting(true);
    try {
      // Convert fields array to object format (only include non-empty fields)
      const fieldsObject: Record<string, string> = {};
      data.fields?.forEach((field) => {
        if (field.fieldName?.trim() && field.fieldValue?.trim()) {
          fieldsObject[field.fieldName.trim()] = field.fieldValue.trim();
        }
      });

      const payload: CreateAcquirerPayload = {
        acquirerName: data.acquirerName.trim(),
        fileName: data.fileName.trim(),
        iconUrl: data.iconUrl || undefined,
        fields: fieldsObject,
      };

      const response = await createAcquirer(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer created successfully!');
          router.push('/admin/acquirers');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create acquirer');
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
      console.error('❌ Error creating acquirer:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create Acquirer"
            description="Create a new payment acquirer"
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
                  name="providerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Provider Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const provider = PROVIDER_TYPES.find(p => p.value === value);
                          if (provider) {
                            form.setValue('fileName', provider.value);
                            if (!form.getValues('acquirerName')) {
                              form.setValue('acquirerName', provider.label);
                            }
                          }
                        }}
                        value={field.value}
                        disabled={submitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Provider Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROVIDER_TYPES.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{provider.label}</span>
                                <span className="text-xs text-muted-foreground">{provider.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            {fileList.length > 0 ? (
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="h-20 w-20 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                                    {fileList[0].dataURL ? (
                                      <img
                                        src={fileList[0].dataURL}
                                        alt="Acquirer icon"
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => {
                                      onImageRemove(0);
                                      setIconFiles([]);
                                      form.setValue('iconUrl', '');
                                    }}
                                    disabled={uploadingIcon || submitting}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{fileList[0].file?.name || 'Icon uploaded'}</p>
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
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Acquirer'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

