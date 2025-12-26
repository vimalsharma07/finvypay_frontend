'use client';

import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { UserDashboardContent } from './components';

/**
 * User Dashboard Page
 * 
 * Dedicated dashboard for user role with user-specific statistics and quick actions
 */
export default function UserDashboardPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Dashboard"
            description="Overview of your transactions, cards, and account activity"
          />
        </Toolbar>
      </Container>
      <Container>
        <UserDashboardContent />
      </Container>
    </Fragment>
  );
}
