'use client';

import { Palette } from 'lucide-react';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { PaymentTemplatesTabContent } from '../payment-links/components/payment-templates-tab-content';

export default function PaymentTemplatesPage() {
  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Payment Templates"
            description="Create, edit, activate, and style templates for payment pages"
            icon={Palette}
          />
          <ToolbarActions />
        </Toolbar>
      </Container>

      <Container>
        <PaymentTemplatesTabContent />
      </Container>
    </>
  );
}
