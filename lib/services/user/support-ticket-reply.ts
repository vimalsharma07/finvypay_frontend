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
    const data = await http.get(
      `${userSupportTicketRoutes.getById(ticketId)}/replies`
    ) as SupportTicketReplyList;
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

export async function addTicketReply(
  ticketId: string | number,
  message: string
): Promise<ApiResponse<SupportTicketReply>> {
  try {
    const data = await http.post(
      `${userSupportTicketRoutes.getById(ticketId)}/replies`,
      { message },
    ) as SupportTicketReply;
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

