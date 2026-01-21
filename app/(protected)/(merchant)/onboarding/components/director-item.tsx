'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Upload, CheckCircle2, File } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Director, FileUploadType } from '@/lib/services/user/onboarding';
import { FileUploadCard } from './file-upload-card';

interface DirectorItemProps {
  director: Director;
  onEdit: (director: Director) => void;
  onDelete: (directorId: string) => Promise<void>;
  onDocumentUploadSuccess?: (directorId: string, filePath: string, documentType?: FileUploadType) => void;
  isDeleting?: boolean;
}

export function DirectorItem({
  director,
  onEdit,
  onDelete,
  onDocumentUploadSuccess,
  isDeleting = false,
}: DirectorItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const hasIdentityProof = !!director.identityProofPath;
  const hasProofOfAddress = !!director.proofOfAddressPath;
  const hasRegisterOfDirector = !!director.registerOfDirectorPath;
  const allDocumentsUploaded = hasIdentityProof && hasProofOfAddress && hasRegisterOfDirector;

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Director Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <h4 className="font-semibold">{director.name}</h4>
                  {allDocumentsUploaded && (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      All Documents Uploaded
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Email: {director.email}</p>
                  <p>Phone: {director.phoneNumber}</p>
                  <p>Address: {director.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(director)}
                  disabled={isDeleting}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="pt-4 border-t space-y-4">
              <FileUploadCard
                type="identity_proof"
                label="Identity Proof"
                description="Upload identity proof document for this director"
                required
                onUploadSuccess={(filePath, s3Id) => {
                  onDocumentUploadSuccess?.(director.id, filePath, 'identity_proof');
                }}
                disabled={hasIdentityProof}
                directorId={director.id}
              />
              
              <FileUploadCard
                type="proof_of_address"
                label="Proof of Address"
                description="Upload proof of address document for this director"
                required
                onUploadSuccess={(filePath, s3Id) => {
                  onDocumentUploadSuccess?.(director.id, filePath, 'proof_of_address');
                }}
                disabled={hasProofOfAddress}
                directorId={director.id}
              />
              
              <FileUploadCard
                type="register_of_director"
                label="Register of Director"
                description="Upload register of director document for this director"
                required
                onUploadSuccess={(filePath, s3Id) => {
                  onDocumentUploadSuccess?.(director.id, filePath, 'register_of_director');
                }}
                disabled={hasRegisterOfDirector}
                directorId={director.id}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Director</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {director.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onDelete(director.id);
                setDeleteDialogOpen(false);
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

