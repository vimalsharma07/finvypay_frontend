'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Archive, 
  CheckSquare, 
  Loader2,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
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
import { 
  getMerchantNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
  type NotificationListMeta,
} from '@/lib/services/user/notifications';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface MerchantNotificationsSheetProps {
  trigger: ReactNode;
  unreadCount?: number;
  onNotificationUpdate?: () => void;
}

export function MerchantNotificationsSheet({ 
  trigger, 
  unreadCount = 0,
  onNotificationUpdate,
}: MerchantNotificationsSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<NotificationListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMerchantNotifications({
        page: 1,
        limit: 20,
        includeDeleted: false,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data.data) {
            setNotifications(data.data);
            setMeta(data.meta || null);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch notifications:', errorMessage);
          toast.error(errorMessage || 'Failed to load notifications');
        },
      });
    } catch (error) {
      console.error('Notification fetch error:', error);
      toast.error('Unexpected error while loading notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    try {
      const response = await markNotificationAsRead(notificationId);
      handleApiResponse(response, {
        onSuccess: () => {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === notificationId
                ? { ...notif, isRead: true, readAt: new Date().toISOString() }
                : notif
            )
          );
          if (meta) {
            setMeta((prev) => ({
              ...prev!,
              unreadCount: Math.max(0, (prev?.unreadCount || 0) - 1),
            }));
          }
          onNotificationUpdate?.();
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to mark notification as read');
        },
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      toast.error('Unexpected error while marking notification as read');
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);
    try {
      const response = await markAllNotificationsAsRead();
      handleApiResponse(response, {
        onSuccess: () => {
          setNotifications((prev) =>
            prev.map((notif) => ({
              ...notif,
              isRead: true,
              readAt: new Date().toISOString(),
            }))
          );
          if (meta) {
            setMeta((prev) => ({
              ...prev!,
              unreadCount: 0,
            }));
          }
          toast.success('All notifications marked as read');
          onNotificationUpdate?.();
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to mark all notifications as read');
        },
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Unexpected error while marking all notifications as read');
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;

    const notificationId = notificationToDelete.id;
    setDeletingId(notificationId);
    try {
      const response = await deleteNotification(notificationId);
      handleApiResponse(response, {
        onSuccess: () => {
          setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
          if (meta) {
            setMeta((prev) => ({
              ...prev!,
              totalItems: Math.max(0, (prev?.totalItems || 0) - 1),
              unreadCount: prev?.unreadCount 
                ? Math.max(0, prev.unreadCount - (notificationToDelete.isRead ? 0 : 1))
                : 0,
            }));
          }
          toast.success('Notification deleted');
          onNotificationUpdate?.();
          setDeleteDialogOpen(false);
          setNotificationToDelete(null);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete notification');
        },
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Unexpected error while deleting notification');
    } finally {
      setDeletingId(null);
    }
  };

  const getNotificationIcon = (type: string, severity: string) => {
    const iconClass = 'size-4';
    if (severity === 'error' || type === 'error') {
      return <XCircle className={`${iconClass} text-destructive`} />;
    }
    if (severity === 'warning' || type === 'warning') {
      return <AlertTriangle className={`${iconClass} text-warning`} />;
    }
    if (severity === 'success' || type === 'success') {
      return <CheckCircle2 className={`${iconClass} text-success`} />;
    }
    return <Info className={`${iconClass} text-primary`} />;
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-0 gap-0 sm:w-[500px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="mb-0">
          <SheetTitle className="p-3 flex items-center justify-between">
            <span>Notifications</span>
            {meta && meta.unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {meta.unreadCount} unread
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <AlertCircle className="size-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No notifications found</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`flex gap-3 px-5 py-4 hover:bg-muted/50 transition-colors ${
                        !notification.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.isRead && (
                              <div className="size-2 rounded-full bg-primary" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              mode="icon"
                              className="size-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(notification);
                              }}
                              disabled={deletingId === notification.id}
                            >
                              {deletingId === notification.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-secondary-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.tag && (
                            <Badge variant="outline" className="text-xs">
                              {notification.tag}
                            </Badge>
                          )}
                        </div>
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <Link href={notification.actionUrl}>
                              <Button size="sm" variant="outline" className="text-xs">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        )}
                        {!notification.isRead && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markingAsRead === notification.id}
                            >
                              {markingAsRead === notification.id ? (
                                <>
                                  <Loader2 className="size-3 animate-spin mr-1" />
                                  Marking...
                                </>
                              ) : (
                                'Mark as read'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < notifications.length - 1 && (
                      <div className="border-b border-border mx-5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetBody>
        <SheetFooter className="border-t border-border p-5 grid grid-cols-2 gap-2.5">
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={markingAllAsRead || meta?.unreadCount === 0}
          >
            {markingAllAsRead ? (
              <Loader2 className="size-4 animate-spin mr-1" />
            ) : (
              <CheckSquare className="size-4 mr-1" />
            )}
            Mark all as read
          </Button>
          <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-1" />
            ) : (
              <Archive className="size-4 mr-1" />
            )}
            Refresh
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{notificationToDelete?.title || 'this notification'}&quot;? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteDialogOpen(false);
                setNotificationToDelete(null);
              }}
              disabled={!!deletingId}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={!!deletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4 mr-1" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

