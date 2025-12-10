'use client';

import dynamic from 'next/dynamic';
import { Container } from '@/components/common/container';

// Dynamically import to avoid SSR issues
const AllProductsContent = dynamic(
  () => import('@/app/(protected)/store-admin/inventory/all-products/content').then(mod => ({ default: mod.AllProductsContent })),
  { ssr: false }
);

export default function AllProductsPage() {
  return (
    <Container>
      <AllProductsContent />
    </Container>
  );
}
