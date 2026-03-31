'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserPaymentTemplate,
  deleteUserPaymentTemplate,
  getUserPaymentTemplates,
  PaymentTemplate,
  updateUserPaymentTemplate,
} from '@/lib/services/user/payment-templates';
import { ImageInput, type ImageInputFiles } from '@/components/image-input';
import { uploadFile } from '@/lib/services/file-upload';

const DEFAULT_PRIMARY_COLOR = '#17B8A6';

export function PaymentTemplatesTabContent() {
  const [templates, setTemplates] = useState<PaymentTemplate[]>([]);
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFiles, setLogoFiles] = useState<ImageInputFiles>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editLogoFiles, setEditLogoFiles] = useState<ImageInputFiles>([]);

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => Number(b.id) - Number(a.id)),
    [templates],
  );

  const fetchTemplates = async () => {
    const response = await getUserPaymentTemplates();
    handleApiResponse(response, {
      onSuccess: (data) => setTemplates(data.data ?? []),
      onError: (message) => toast.error(message || 'Failed to load payment templates'),
    });
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const onCreate = async () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await createUserPaymentTemplate({
        name: name.trim(),
        primaryColor,
        logoUrl: logoUrl || undefined,
      });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Payment template created successfully');
          setName('');
          setPrimaryColor(DEFAULT_PRIMARY_COLOR);
          setLogoUrl('');
          fetchTemplates();
        },
        onError: (message) => toast.error(message || 'Failed to create payment template'),
      });
    } finally {
      setLoading(false);
    }
  };

  const onToggleActive = async (template: PaymentTemplate, active: boolean) => {
    const response = await updateUserPaymentTemplate(template.id, { isActive: active });
    handleApiResponse(response, {
      onSuccess: () => {
        toast.success(`Template ${active ? 'activated' : 'deactivated'} successfully`);
        fetchTemplates();
      },
      onError: (message) => toast.error(message || 'Failed to update status'),
    });
  };

  const onDelete = async (templateId: string) => {
    const response = await deleteUserPaymentTemplate(templateId);
    handleApiResponse(response, {
      onSuccess: () => {
        toast.success('Payment template deleted successfully');
        fetchTemplates();
      },
      onError: (message) => toast.error(message || 'Failed to delete template'),
    });
  };

  const startEdit = (template: PaymentTemplate) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditColor(template.primaryColor);
    setEditLogoUrl(template.logoUrl || '');
    setEditLogoFiles([]);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editName.trim()) {
      toast.error('Template name is required');
      return;
    }
    const response = await updateUserPaymentTemplate(editingId, {
      name: editName.trim(),
      primaryColor: editColor,
      logoUrl: editLogoUrl || undefined,
    });
    handleApiResponse(response, {
      onSuccess: () => {
        toast.success('Payment template updated successfully');
        setEditingId(null);
        fetchTemplates();
      },
      onError: (message) => toast.error(message || 'Failed to update template'),
    });
  };

  const onUploadLogo = async (file: File, isEdit: boolean) => {
    setUploadingLogo(true);
    try {
      const uploadResponse = await uploadFile(file, 'Payment template logo', 'common');
      const url = uploadResponse?.url || '';
      if (!url) {
        toast.error('Upload succeeded but logo URL was not returned');
        return;
      }
      if (isEdit) {
        setEditLogoUrl(url);
      } else {
        setLogoUrl(url);
      }
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCreateLogoChange = async (files: ImageInputFiles) => {
    setLogoFiles(files);
    if (files.length > 0 && files[0].file) {
      await onUploadLogo(files[0].file, false);
    } else {
      setLogoUrl('');
    }
  };

  const handleEditLogoChange = async (files: ImageInputFiles) => {
    setEditLogoFiles(files);
    if (files.length > 0 && files[0].file) {
      await onUploadLogo(files[0].file, true);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Create Template</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] items-end">
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brand Blue Template"
            />
          </div>
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 p-1"
            />
          </div>
          <div>
            <Label htmlFor="templateLogo">Logo</Label>
            <ImageInput
              value={logoFiles}
              onChange={handleCreateLogoChange}
              acceptType={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']}
              multiple={false}
            >
              {({ onImageUpload, fileList, onImageRemove, isDragging, dragProps }) => (
                <div className="space-y-2">
                  {fileList.length > 0 || logoUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-20 rounded-lg border bg-white p-1 flex items-center justify-center">
                        <img
                          src={logoUrl || fileList[0]?.dataURL}
                          alt="Template logo"
                          className="h-full w-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground"
                          onClick={() => {
                            onImageRemove(0);
                            setLogoFiles([]);
                            setLogoUrl('');
                          }}
                          disabled={uploadingLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Logo uploaded</p>
                    </div>
                  ) : (
                    <div
                      {...dragProps}
                      onClick={onImageUpload}
                      className={`border-2 border-dashed rounded-lg px-3 py-3 text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      } ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs">Click or drag logo</p>
                    </div>
                  )}
                </div>
              )}
            </ImageInput>
          </div>
          <Button onClick={onCreate} disabled={loading}>
            <Plus className="h-4 w-4 me-1" />
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedTemplates.map((template) => {
              const isEditing = editingId === template.id;
              return (
                <div key={template.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div
                    className="mb-3 h-36 rounded-lg border p-3"
                    style={{
                      background: `linear-gradient(140deg, ${template.primaryColor} 0%, ${template.primaryColor}BB 55%, #0f172a 100%)`,
                    }}
                  >
                    <div className="flex h-full flex-col justify-between text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs opacity-90">Checkout Preview</p>
                        {template.logoUrl && (
                          <img
                            src={template.logoUrl}
                            alt={template.name}
                            className="h-7 max-w-20 object-contain rounded bg-white/90 px-1"
                          />
                        )}
                      </div>
                      <div>
                        <div className="mb-2 h-2 w-20 rounded-full bg-white/70" />
                        <div className="mb-3 h-2 w-28 rounded-full bg-white/50" />
                        <div className="h-8 w-full rounded-md bg-white/85 text-[11px] text-slate-900 flex items-center px-2">
                          Pay Now
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="h-9 w-12 p-1"
                        />
                        <p className="text-xs text-muted-foreground">{editColor}</p>
                      </div>
                      <div>
                        <Label htmlFor={`templateLogoEdit-${template.id}`}>Logo</Label>
                        <ImageInput
                          value={editLogoFiles}
                          onChange={handleEditLogoChange}
                          acceptType={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']}
                          multiple={false}
                        >
                          {({ onImageUpload, fileList, onImageRemove, isDragging, dragProps }) => (
                            <div className="space-y-2">
                              {fileList.length > 0 || editLogoUrl ? (
                                <div className="flex items-center gap-3">
                                  <div className="relative h-11 w-20 rounded-lg border bg-white p-1 flex items-center justify-center">
                                    <img
                                      src={editLogoUrl || fileList[0]?.dataURL}
                                      alt="Template logo"
                                      className="h-full w-full object-contain"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground"
                                      onClick={() => {
                                        onImageRemove(0);
                                        setEditLogoFiles([]);
                                        setEditLogoUrl('');
                                      }}
                                      disabled={uploadingLogo}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">Logo uploaded</p>
                                </div>
                              ) : (
                                <div
                                  {...dragProps}
                                  onClick={onImageUpload}
                                  className={`border-2 border-dashed rounded-lg px-3 py-3 text-center cursor-pointer transition-colors ${
                                    isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                  } ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Upload className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs">Click or drag logo</p>
                                </div>
                              )}
                            </div>
                          )}
                        </ImageInput>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{template.name}</p>
                          <p className="text-xs text-muted-foreground">Template #{template.id}</p>
                        </div>
                        <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: template.primaryColor }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={(checked) => onToggleActive(template, checked)}
                          />
                          <p className="text-xs text-muted-foreground">
                            {template.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(template)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {sortedTemplates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No templates yet. Create one to reuse brand colors in payment links.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
