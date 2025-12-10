'use client';

import { Fragment, useEffect, useRef } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { getUsers, UserListResponse } from '@/lib/services/users-api';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { TableComp } from '../../components/table-comp';

export default function AdminUsersPage() {
  // Use ref to prevent multiple API calls in development
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent multiple calls (React 19 dev mode can cause multiple renders)
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Call API when component mounts
    const fetchUsers = async () => {
      try {
        const response = await getUsers({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        });

        // Handle response using centralized handler
        handleApiResponse<UserListResponse>(response, {
          onSuccess: (data) => {
            if (data.success) {
              console.log('Users list:', data.data.data);
              console.log('Meta info:', data.data.meta);
            } else {
              console.warn('⚠️ API returned success=false:', data);
            }
          },
          onValidationError: (errors, messages) => {
            console.error('Validation errors:', errors);
          },
          onUnauthorized: () => {
            console.log('Please check your TOKEN in .env file');
          },
        });
      } catch (error) {
        console.error('❌ Network/Request error:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Admins"
            description="Manage and view all admin users "
          />
        </Toolbar>
      </Container>
      <Container>
        <TableComp />
      </Container>
    </Fragment>
  );
}
