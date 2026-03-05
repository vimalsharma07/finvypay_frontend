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
    const data = await http.get(
      `${adminSupportTicketBase(ticketId)}/replies`
    ) as AdminSupportTicketReplyList;
    return {
      status: 200,
      data,
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
    const data = await http.post(
      `${adminSupportTicketBase(ticketId)}/replies`,
      { message },
    ) as AdminSupportTicketReply;
    return {
      status: 200,
      data,
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

