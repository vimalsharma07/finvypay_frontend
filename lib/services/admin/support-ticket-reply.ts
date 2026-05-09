import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';
import type { SupportTicketUser } from './support-ticket';

export interface AdminSupportTicketReply {
  id: number;
  message: string;
  authorType: 'ADMIN' | 'MERCHANT';
  createdAt: string;
  user: SupportTicketUser | null;
}

export type AdminSupportTicketReplyList = AdminSupportTicketReply[];

const adminSupportTicketBase = adminRoutes.supportTicket.getById;

export async function getAdminTicketReplies(
  ticketId: string | number
): Promise<ApiResponse<AdminSupportTicketReplyList>> {
  try {
    const response = await http.get(
      `${adminSupportTicketBase(ticketId)}/replies`
    ) as { success?: boolean; data?: AdminSupportTicketReplyList } | AdminSupportTicketReplyList;

    const replies: AdminSupportTicketReplyList =
      response && typeof response === 'object' && 'success' in response && 'data' in response
        ? (response as { success?: boolean; data?: AdminSupportTicketReplyList }).data || []
        : (Array.isArray(response) ? (response as AdminSupportTicketReplyList) : []);
    return {
      status: 200,
      data: replies,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function addAdminTicketReply(
  ticketId: string | number,
  message: string
): Promise<ApiResponse<AdminSupportTicketReply>> {
  try {
    const response = await http.post(
      `${adminSupportTicketBase(ticketId)}/replies`,
      { message },
    ) as { success?: boolean; data?: AdminSupportTicketReply } | AdminSupportTicketReply;

    const reply: AdminSupportTicketReply =
      response && typeof response === 'object' && 'success' in response && 'data' in response
        ? (response as { success?: boolean; data?: AdminSupportTicketReply }).data as AdminSupportTicketReply
        : (response as AdminSupportTicketReply);
    return {
      status: 200,
      data: reply,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

