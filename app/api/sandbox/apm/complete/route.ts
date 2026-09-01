import { NextRequest, NextResponse } from 'next/server';
import { getApiErrorMessage } from '@/lib/utils/get-api-error-message';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transactionId = body?.transactionId ?? body?.transaction_id ?? '';
    const success =
      typeof body?.success === 'boolean'
        ? body.success
        : body?.status !== 'failed';

    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'transactionId is required' },
        { status: 400 }
      );
    }

    if (!API_BASE) {
      return NextResponse.json(
        { success: false, message: 'API URL is not configured' },
        { status: 500 }
      );
    }

    const url = `${API_BASE}/api/v1/sandbox/apm/complete`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: transactionId.trim(),
        success,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && typeof data === 'object' && data.success === false)) {
      return NextResponse.json(
        {
          success: false,
          message: getApiErrorMessage(data, `Backend returned ${res.status}`),
        },
        { status: res.ok ? 400 : res.status }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
