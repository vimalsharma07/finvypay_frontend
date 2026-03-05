import { http, ApiError } from '../../api';
import { userSupportTicketRoutes } from '../../routes/user/support-ticket-routes';
import type { ApiResponse } from '../types';
import type { SupportTicketUser } from './support-ticket';

export interface SupportTicketReply {
  id: number;
  message: string;
  authorType: 'ADMIN' | 'MERCHANT';
  createdAt: string;
  user: SupportTicketUser | null;
}

export type SupportTicketReplyList = SupportTicketReply[];

export async function getTicketReplies(
  ticketId: string | number
): Promise<ApiResponse<SupportTicketReplyList>> {
  try {
    const response = await http.get(
      `${userSupportTicketRoutes.getById(ticketId)}/replies`
    ) as { success?: boolean; data?: SupportTicketReplyList } | SupportTicketReplyList;

    const replies: SupportTicketReplyList =
      response && typeof response === 'object' && 'success' in response && 'data' in response
        ? (response as { success?: boolean; data?: SupportTicketReplyList }).data || []
        : (Array.isArray(response) ? (response as SupportTicketReplyList) : []);

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

export async function addTicketReply(
  ticketId: string | number,
  message: string
): Promise<ApiResponse<SupportTicketReply>> {
  try {
    const response = await http.post(
      `${userSupportTicketRoutes.getById(ticketId)}/replies`,
      { message },
    ) as { success?: boolean; data?: SupportTicketReply } | SupportTicketReply;

    const reply: SupportTicketReply =
      response && typeof response === 'object' && 'success' in response && 'data' in response
        ? (response as { success?: boolean; data?: SupportTicketReply }).data as SupportTicketReply
        : (response as SupportTicketReply);

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

