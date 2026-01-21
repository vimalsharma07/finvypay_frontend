'use client';

import dynamic from 'next/dynamic';
import { Plug, ArrowLeft } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';
import Link from 'next/link';

const EditAcquirerContent = dynamic(
  () => import('./edit-acquirer-content').then(mod => ({ default: mod.EditAcquirerContent })),
  {
    loading: () => <FormSkeleton fields={10} />,
    ssr: false,
  }
);

export default function EditAcquirerPage() {
  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Edit Acquirer"
            description="Update payment gateway acquirer details including name, configuration settings, and integration parameters"
            icon={Plug}
          />
          <div className="flex items-center">
            <Link
              href="/admin/acquirers"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>
        </Toolbar>
      </Container>
      <EditAcquirerContent />
    </>
  );
}
