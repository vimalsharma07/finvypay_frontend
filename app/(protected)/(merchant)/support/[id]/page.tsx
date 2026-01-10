'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LifeBuoy } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getSupportTicketById,
  SupportTicket,
} from '@/lib/services/user/support-ticket';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, ExternalLink, Image as ImageIcon, User } from 'lucide-react';

export default function ViewTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    setLoading(true);
    try {
      const response = await getSupportTicketById(ticketId);
      handleApiResponse<SupportTicket>(response, {
        onSuccess: (data) => {
          // Data is already extracted in the service function
          if (data && typeof data === 'object' && 'id' in data) {
            setTicket(data);
          } else {
            toast.error('Failed to fetch ticket - invalid response structure');
            router.push('/support');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch ticket');
          router.push('/support');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Fetch ticket error:', error);
      router.push('/support');
    } finally {
      setLoading(false);
    }
  }, [ticketId, router]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const getPriorityBadgeVariant = (priority: string | undefined | null): 'primary' | 'destructive' | 'secondary' | 'warning' | 'info' => {
    if (!priority) return 'primary';
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'primary';
      case 'LOW':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const getStatusBadgeVariant = (status: string | undefined | null): 'primary' | 'destructive' | 'secondary' | 'success' | 'warning' | 'info' => {
    if (!status) return 'primary';
    switch (status) {
      case 'OPEN':
        return 'primary';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const formatStatus = (status: string | undefined | null): string => {
    if (!status) return '-';
    return status.replace('_', ' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getImageExtension = (url: string): string => {
    const match = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
    return match ? match[1].toLowerCase() : '';
  };

  const isImageFile = (url: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const ext = getImageExtension(url);
    return imageExtensions.includes(ext);
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="View Ticket"
              description="Loading support ticket details and conversation history..."
              icon={LifeBuoy}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-12">
            <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading ticket details...</p>
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!ticket) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="View Ticket"
              description="Support ticket not found or you don't have access to view this ticket"
              icon={LifeBuoy}
            />
          </Toolbar>
        </Container>
        <Container>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Ticket not found</p>
                <Button variant="outline" onClick={() => router.push('/support')}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={`Ticket #${ticket.id}`}
            description={`View support ticket details, status, conversation history, and attachments for ticket #${ticket.id}`}
            icon={LifeBuoy}
          />
          <ToolbarActions>
            <Button variant="outline" onClick={() => router.push('/support')}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Support
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          {/* Main Ticket Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="text-sm">
                      {ticket.priority || '-'}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-sm">
                      {formatStatus(ticket.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Description</h3>
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {ticket.description || '-'}
                </div>
              </div>

              {/* Attached Image */}
              {ticket.filePath && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="size-4" />
                    Attachment
                  </h3>
                  {isImageFile(ticket.filePath) ? (
                    <div className="relative rounded-lg border overflow-hidden bg-muted group">
                      <div className="relative w-full max-w-3xl mx-auto">
                        <div className="relative aspect-video w-full bg-muted/50 flex items-center justify-center">
                          <img
                            src={ticket.filePath}
                            alt="Ticket attachment"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="text-center p-8 text-muted-foreground">Failed to load image</div>';
                              }
                            }}
                          />
                        </div>
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            asChild
                            className="backdrop-blur-sm bg-background/90 shadow-md"
                          >
                            <a
                              href={ticket.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2"
                            >
                              <ExternalLink className="size-4" />
                              Open Full Size
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <a
                        href={ticket.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="size-4" />
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="border-t" />

              {/* Ticket Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="size-4" />
                    User Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">{ticket.user?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      <span className="font-medium">{ticket.user?.email || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Dates */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="size-4" />
                    Ticket Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Clock className="size-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Created:</span>{' '}
                        <span className="font-medium">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="size-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Updated:</span>{' '}
                        <span className="font-medium">{formatDate(ticket.updatedAt)}</span>
                      </div>
                    </div>
                    {ticket.closedAt && (
                      <div className="flex items-start gap-2">
                        <Clock className="size-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">Closed:</span>{' '}
                          <span className="font-medium">{formatDate(ticket.closedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Fragment>
  );
}

