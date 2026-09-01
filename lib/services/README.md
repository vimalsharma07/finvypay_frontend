# Services Directory Structure

## Overview

All API services are organized by domain for better maintainability and understanding.

## Directory Structure

```
lib/services/
├── auth/
│   └── index.ts          # Authentication services (login, register, refresh, etc.)
├── admin/
│   ├── index.ts          # Admin services barrel export
│   ├── roles.ts          # Roles management
│   ├── permissions.ts    # Permissions management
│   └── users.ts          # User management
└── index.ts              # Main barrel export (all services)
```

## Usage

### Import from specific service
```typescript
// Auth services
import { login, register, refreshToken } from '@/lib/services/auth';

// Admin services
import { getRoles, createRole } from '@/lib/services/admin/roles';
import { getPermissions } from '@/lib/services/admin/permissions';
import { getUsers, createUser } from '@/lib/services/admin/users';
```

### Import from barrel exports
```typescript
// All services
import { login, getRoles, getUsers } from '@/lib/services';

// All admin services
import { getRoles, getPermissions, getUsers } from '@/lib/services/admin';
```

## Services by Category

### Auth (`lib/services/auth/`)
- `login()` - Email/password login
- `register()` - User registration
- `validateUser()` - Validate credentials
- `googleLogin()` - Google OAuth
- `forgotPassword()` - Send reset OTP to email
- `resetPassword()` - Reset password with email, OTP, and new password
- `changePassword()` - Change password
- `verifyEmail()` - Verify email
- `resendVerification()` - Resend verification
- `sendOtp()` - Send OTP for signin
- `verifyOtp()` - Verify OTP for signin
- `verifyRegistrationOtp()` - Verify registration OTP
- `refreshToken()` - Refresh access token

### Admin (`lib/services/admin/`)

#### Roles (`roles.ts`)
- `getRoles()` - Get all roles
- `getRoleById()` - Get role by ID
- `createRole()` - Create new role
- `deleteRole()` - Delete role

#### Permissions (`permissions.ts`)
- `getPermissions()` - Get all permissions

#### Users (`users.ts`)
- `getUsers()` - Get all users
- `getUserById()` - Get user by ID
- `createUser()` - Create new user
- `updateUser()` - Update user
- `deleteUser()` - Delete user
- `searchUsers()` - Search users
- `bulkDeleteUsers()` - Bulk delete users

