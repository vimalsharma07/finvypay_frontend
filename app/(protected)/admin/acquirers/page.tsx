'use client';

import { Fragment, useEffect, useState } from 'react';
import { Plug } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getAcquirers,
  updateAcquirer,
  deleteAcquirer,
  Acquirer,
  AcquirerListResponse,
} from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { Search, X, Pencil, Trash2, Plus, ArrowRight, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Default icon image path
const DEFAULT_ACQUIRER_ICON = '/media/app/pay4tech.png';

// Helper function to get icon URL from publicId
// If iconUrl is a full URL, return it; if it's a publicId (starts with "uploads/"), construct the URL
const getIconUrl = (iconUrl?: string): string | null => {
  if (!iconUrl) return null;
  
  // If it's already a full URL, return it
  if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
    return iconUrl;
  }
  
  // If it's a publicId (starts with "uploads/"), construct the URL
  // Format: https://stagebucket4all.s3.amazonaws.com/{publicId}
  if (iconUrl.startsWith('uploads/')) {
    return `https://stagebucket4all.s3.amazonaws.com/${iconUrl}`;
  }
  
  return iconUrl;
};

// Helper function to get provider icon/logo based on fileName or iconUrl
const getProviderIcon = (fileName: string, iconUrl?: string): string | null => {
  // If iconUrl is provided, return null to show image instead
  if (iconUrl) {
    return null;
  }
  
  // Fallback to emoji icons based on fileName
  if (fileName.includes('test-gateway')) {
    return '🧪'; // TestGateway icon placeholder
  }
  if (fileName.includes('cardserv')) {
    return '💳'; // CardServ icon placeholder
  }
  return null; // Return null to show default image instead of emoji
};

// Helper function to get provider description
const getProviderDescription = (fileName: string, acquirerName: string): string => {
  if (fileName.includes('test-gateway')) {
    return 'Test Provider for sandbox testing and development.';
  }
  if (fileName.includes('cardserv')) {
    return 'CardServ payment provider for processing card transactions.';
  }
  return `Payment acquirer: ${acquirerName}`;
};

export default function AdminAcquirersPage() {
  const router = useRouter();
  const [acquirers, setAcquirers] = useState<Acquirer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [acquirerToDelete, setAcquirerToDelete] = useState<Acquirer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [meta, setMeta] = useState<AcquirerListResponse['data']['meta'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<Record<string | number, boolean>>({});

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20); // Increased for card view

  const fetchAcquirers = async (pageNum: number, pageLimit: number) => {
    setLoading(true);
    try {
      const response = await getAcquirers({
        page: pageNum,
        limit: pageLimit,
      });
      handleApiResponse<AcquirerListResponse>(response, {
        onSuccess: (data) => {
          // New format: { success: true, data: [...], meta: {...} }
          if (data && data.success && data.data) {
            setAcquirers(data.data);
            setMeta(data.meta);
          } else {
            toast.error('Failed to fetch acquirers - invalid response structure');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch acquirers');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcquirers(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleDeleteAcquirer = async () => {
    if (!acquirerToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteAcquirer(acquirerToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer deleted successfully!');
          setDeleteDialogOpen(false);
          setAcquirerToDelete(null);
          fetchAcquirers(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete acquirer');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete acquirer error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (acquirer: Acquirer, checked: boolean) => {
    setUpdatingStatus({ ...updatingStatus, [acquirer.id]: true });
    try {
      const newStatus = checked ? 'active' : 'inactive';
      const response = await updateAcquirer(acquirer.id, {
        acquirerName: acquirer.acquirerName,
        fileName: acquirer.fileName,
        fields: acquirer.fields || {},
        status: newStatus,
      });

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(`Acquirer ${checked ? 'activated' : 'deactivated'} successfully!`);
          fetchAcquirers(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update acquirer status');
          // Revert the toggle on error
          setUpdatingStatus({ ...updatingStatus, [acquirer.id]: false });
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      setUpdatingStatus({ ...updatingStatus, [acquirer.id]: false });
    } finally {
      setUpdatingStatus((prev) => {
        const newState = { ...prev };
        delete newState[acquirer.id];
        return newState;
      });
    }
  };

  const filteredAcquirers = searchQuery
    ? acquirers.filter(
        (acquirer) =>
          acquirer.acquirerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acquirer.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : acquirers;

  const totalPages = meta?.totalPages || 1;
  const currentPage = meta?.currentPage || 1;

  if (loading && acquirers.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Acquirers"
              description="Create, edit, and manage payment gateway acquirers with configuration settings and account management"
              icon={Plug}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-8">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
            <ToolbarHeading
              title="Acquirers"
              description="Create, edit, and manage payment gateway acquirers with configuration settings and account management"
              icon={Plug}
            />
          <ToolbarActions>
            <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                    <Input
                  placeholder="Search acquirers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-9 w-40"
                    />
                    {searchQuery.length > 0 && (
                      <Button
                        mode="icon"
                        variant="ghost"
                        className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery('')}
                      >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                onClick={() => router.push('/admin/acquirers/create')}
              >
                <Plus className="size-4 mr-2" />
                Create Acquirer
              </Button>
            </div>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        {filteredAcquirers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No acquirers found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-7.5">
              {filteredAcquirers.map((acquirer) => {
                const isActive = acquirer.status?.toLowerCase() === 'active';
                const isUpdating = updatingStatus[acquirer.id] || false;

                return (
                  <div
                    key={acquirer.id}
                    className="flex flex-col items-stretch text-card-foreground rounded-xl bg-card border border-border shadow-xs shadow-black/5"
                  >
                    {/* Card Content */}
                    <div className="grow p-5 lg:p-7.5">
                      <div className="flex items-center justify-between mb-3 lg:mb-5">
                        <div className="flex items-center justify-center">
                          <div className="h-11 w-11 flex items-center justify-center text-2xl bg-muted rounded-lg overflow-hidden">
                            {(() => {
                              const iconUrl = getIconUrl(acquirer.iconUrl);
                              const emojiIcon = getProviderIcon(acquirer.fileName, acquirer.iconUrl);
                              
                              if (iconUrl) {
                                return (
                                  <img
                                    src={iconUrl}
                                    alt={acquirer.acquirerName}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      // Fallback to default image if uploaded image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.src = DEFAULT_ACQUIRER_ICON;
                                    }}
                                  />
                                );
                              }
                              
                              if (emojiIcon) {
                                return <span>{emojiIcon}</span>;
                              }
                              
                              // Show default image when no icon is uploaded
                              return (
                                <img
                                  src={DEFAULT_ACQUIRER_ICON}
                                  alt="Default acquirer icon"
                                  className="h-full w-full object-cover"
                                />
                              );
                            })()}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/acquirers/${acquirer.id}/edit`}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="size-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setAcquirerToDelete(acquirer);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-col gap-1 lg:gap-2.5">
                        <Link
                          href={`/admin/acquirers/${acquirer.id}/edit`}
                          className="text-base font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {acquirer.acquirerName}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          {getProviderDescription(acquirer.fileName, acquirer.acquirerName)}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex px-5 min-h-14 border-t border-border justify-between items-center py-3.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8.5 text-[0.8125rem] gap-1.5"
                        asChild
                      >
                        <Link href={`/admin/acquirers/acquirer-accounts?acquirerId=${acquirer.id}`}>
                          <Plug className="size-4" />
                          Accounts
                        </Link>
                      </Button>
                      <div className="flex items-center gap-2.5">
                        <SwitchWrapper>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) => handleStatusToggle(acquirer, checked)}
                            disabled={isUpdating}
                            size="sm"
                          />
                        </SwitchWrapper>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, meta?.totalItems || 0)} of {meta?.totalItems || 0} acquirers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Container>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Acquirer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete acquirer &quot;{acquirerToDelete?.acquirerName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              <X className="h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAcquirer}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}

