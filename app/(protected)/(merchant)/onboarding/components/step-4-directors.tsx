'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight } from 'lucide-react';
import { DirectorFormDialog } from './director-form-dialog';
import { DirectorItem } from './director-item';
import {
  addDirector,
  updateDirector,
  deleteDirector,
  getDirectors,
  getOnboardingStatus,
  AddDirectorPayload,
  UpdateDirectorPayload,
  Director,
  OnboardingData,
  FileUploadType,
} from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

interface Step4DirectorsProps {
  onboardingData: OnboardingData;
  onNext: () => void;
  onUpdate?: () => void;
}

export function Step4Directors({ onboardingData, onNext, onUpdate }: Step4DirectorsProps) {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch directors on mount
  useEffect(() => {
    fetchDirectors();
  }, []);

  // Also load directors from onboarding data if available
  useEffect(() => {
    if (onboardingData?.onboarding?.directors) {
      const onboardingDirectors = onboardingData.onboarding.directors as Director[];
      if (Array.isArray(onboardingDirectors) && onboardingDirectors.length > 0) {
        setDirectors(onboardingDirectors);
      }
    }
  }, [onboardingData]);

  const fetchDirectors = async () => {
    setLoading(true);
    try {
      const response = await getDirectors();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success) {
            // Handle both { success: true, data: [...] } and direct array
            const directorsList = Array.isArray(data.data) 
              ? data.data 
              : (Array.isArray(data) ? data : []);
            setDirectors(directorsList);
          } else if (Array.isArray(data)) {
            // Handle direct array response
            setDirectors(data);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch directors:', errorMessage);
        },
      });
    } catch (error) {
      console.error('Directors fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOnboardingData = async () => {
    try {
      const response = await getOnboardingStatus();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data?.onboarding?.directors) {
            const onboardingDirectors = data.data.onboarding.directors as Director[];
            if (Array.isArray(onboardingDirectors)) {
              setDirectors(onboardingDirectors);
            }
          }
        },
      });
    } catch (error) {
      console.error('Failed to refresh onboarding data:', error);
    }
  };

  const handleAddDirector = async (data: AddDirectorPayload | UpdateDirectorPayload) => {
    setIsSubmitting(true);
    try {
      // Type guard to ensure all required fields are present
      if (!('name' in data && data.name && 'email' in data && data.email && 'countryCodeId' in data && data.countryCodeId && 'phoneNumber' in data && data.phoneNumber && 'address' in data && data.address)) {
        toast.error('All fields are required');
        setIsSubmitting(false);
        return;
      }
      
      const addPayload: AddDirectorPayload = {
        name: data.name!,
        email: data.email!,
        countryCodeId: data.countryCodeId!,
        phoneNumber: data.phoneNumber!,
        address: data.address!,
      };
      
      const response = await addDirector(addPayload);
      handleApiResponse(response, {
        onSuccess: async (responseData) => {
          if (responseData && responseData.success) {
            toast.success('Director added successfully');
            setAddDialogOpen(false);
            await refreshOnboardingData();
            onUpdate?.();
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to add director');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Add director error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDirector = async (data: AddDirectorPayload | UpdateDirectorPayload) => {
    if (!selectedDirector) return;

    setIsSubmitting(true);
    try {
      const updatePayload: UpdateDirectorPayload = {
        name: data.name,
        email: data.email,
        countryCodeId: data.countryCodeId,
        phoneNumber: data.phoneNumber,
        address: data.address,
      };
      
      const response = await updateDirector(selectedDirector.id, updatePayload);
      handleApiResponse(response, {
        onSuccess: async (responseData) => {
          if (responseData && responseData.success) {
            toast.success('Director updated successfully');
            setEditDialogOpen(false);
            setSelectedDirector(null);
            await refreshOnboardingData();
            onUpdate?.();
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update director');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update director error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDirector = async (directorId: string) => {
    setIsDeleting(directorId);
    try {
      const response = await deleteDirector(directorId);
      handleApiResponse(response, {
        onSuccess: async () => {
          toast.success('Director deleted successfully');
          await refreshOnboardingData();
          onUpdate?.();
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete director');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete director error:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDocumentUploadSuccess = async (directorId: string, filePath: string, documentType?: FileUploadType) => {
    // CRITICAL: Immediately update the director in state so UI updates instantly
    // This makes hasDocument = true immediately, which shows the badge and disables the upload card
    setDirectors((prevDirectors) =>
      prevDirectors.map((director) => {
        if (director.id === directorId) {
          const updated = { ...director };
          // Update the appropriate document path based on type
          if (documentType === 'identity_proof') {
            updated.identityProofPath = filePath;
          } else if (documentType === 'proof_of_address') {
            updated.proofOfAddressPath = filePath;
          } else if (documentType === 'register_of_director') {
            updated.registerOfDirectorPath = filePath;
          }
          return updated;
        }
        return director;
      })
    );
    
    // Then refresh from API in background for consistency
    await refreshOnboardingData();
    onUpdate?.();
  };

  // Check if all directors have all three documents uploaded
  const allDirectorsHaveDocuments = directors.length > 0 && directors.every(
    (director) => 
      !!director.identityProofPath && 
      !!director.proofOfAddressPath && 
      !!director.registerOfDirectorPath
  );

  const handleContinue = () => {
    if (directors.length === 0) {
      toast.error('Please add at least one director');
      return;
    }

    if (!allDirectorsHaveDocuments) {
      toast.error('Please upload all required documents (Identity Proof, Proof of Address, and Register of Director) for all directors');
      return;
    }

    onNext();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">Loading directors...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Directors</CardTitle>
              <CardDescription>
                Add directors and upload their register of director documents
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Director
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {directors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No directors added yet.</p>
              <p>Click "Add Director" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {directors.map((director) => (
                <DirectorItem
                  key={director.id}
                  director={director}
                  onEdit={(dir) => {
                    setSelectedDirector(dir);
                    setEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteDirector}
                  onDocumentUploadSuccess={handleDocumentUploadSuccess}
                  isDeleting={isDeleting === director.id}
                />
              ))}
            </div>
          )}

          {directors.length > 0 && (
            <div className="flex justify-end pt-6 border-t mt-6">
              <Button
                type="button"
                variant="primary"
                onClick={handleContinue}
                disabled={!allDirectorsHaveDocuments}
                className="gap-2"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {directors.length > 0 && !allDirectorsHaveDocuments && (
            <p className="text-sm text-destructive text-right mt-2">
              Please upload all required documents (Identity Proof, Proof of Address, and Register of Director) for all directors
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Director Dialog */}
      <DirectorFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddDirector}
        isSubmitting={isSubmitting}
      />

      {/* Edit Director Dialog */}
      <DirectorFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedDirector(null);
          }
        }}
        onSubmit={handleEditDirector}
        director={selectedDirector}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

