import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  fromName: string;
  logoUrl?: string;
}

interface SmtpTestLog {
  level: 'info' | 'success' | 'error';
  message: string;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeSmtpError(error: unknown): SmtpTestLog[] {
  const logs: SmtpTestLog[] = [];
  if (!(error instanceof Error) && !error) {
    logs.push({ level: 'error', message: 'Unknown SMTP failure' });
    return logs;
  }

  const err = error as Error & {
    code?: string;
    command?: string;
    response?: string;
    responseCode?: number;
    syscall?: string;
    address?: string;
    port?: number;
  };

  if (err.message) {
    logs.push({ level: 'error', message: err.message });
  }
  if (err.code) {
    logs.push({ level: 'error', message: `Code: ${err.code}` });
  }
  if (err.command) {
    logs.push({ level: 'error', message: `Command: ${err.command}` });
  }
  if (typeof err.responseCode === 'number') {
    logs.push({ level: 'error', message: `SMTP response code: ${err.responseCode}` });
  }
  if (err.response) {
    logs.push({ level: 'error', message: `SMTP response: ${err.response}` });
  }
  if (err.syscall) {
    logs.push({
      level: 'error',
      message: `Network: ${err.syscall}${err.address ? ` ${err.address}` : ''}${err.port ? `:${err.port}` : ''}`,
    });
  }

  return logs.length ? logs : [{ level: 'error', message: 'Failed to send test email' }];
}

async function fetchSmtpConfig(authorization: string): Promise<SmtpConfig> {
  if (!API_BASE) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const url = `${API_BASE}/smtp-config`;
  const headers = {
    Authorization: authorization,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, { method: 'GET', headers });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload?.success === false) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      payload?.error ||
      `Failed to load SMTP config (${res.status})`;
    throw new Error(String(message));
  }

  const data = payload?.data ?? payload;
  const config: SmtpConfig = {
    host: String(data?.host ?? '').trim(),
    port: Number(data?.port),
    username: String(data?.username ?? '').trim(),
    password: String(data?.password ?? ''),
    from: String(data?.from ?? '').trim(),
    fromName: String(data?.fromName ?? '').trim(),
    logoUrl: String(data?.logoUrl ?? '').trim(),
  };

  if (!config.host || !config.port || !config.username || !config.password || !config.from) {
    throw new Error('SMTP config is incomplete');
  }

  return config;
}

export async function POST(request: NextRequest) {
  const logs: SmtpTestLog[] = [];

  try {
    const authorization = request.headers.get('authorization') || '';
    if (!authorization.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization token is required',
          logs: [{ level: 'error', message: 'Missing Bearer token' }],
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const to = String(body?.to ?? '').trim();
    if (!isEmail(to)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Enter a valid email address',
          logs: [{ level: 'error', message: 'Invalid recipient email' }],
        },
        { status: 400 }
      );
    }

    logs.push({ level: 'info', message: `Loading SMTP config for test send to ${to}` });
    const config = await fetchSmtpConfig(authorization);
    logs.push({
      level: 'info',
      message: `Using ${config.host}:${config.port} as ${config.username}`,
    });

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    logs.push({ level: 'info', message: 'Verifying SMTP connection...' });
    await transporter.verify();
    logs.push({ level: 'success', message: 'SMTP connection verified' });

    const fromHeader = config.fromName
      ? `"${config.fromName}" <${config.from}>`
      : config.from;
    const logoHtml = config.logoUrl
      ? `<p><img src="${config.logoUrl}" alt="${config.fromName || 'Logo'}" height="40" /></p>`
      : '';

    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      subject: 'FinvyPay SMTP test email',
      text: 'This is a dummy SMTP test email from FinvyPay admin.',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          ${logoHtml}
          <h2>SMTP test successful</h2>
          <p>This is a dummy email sent from the FinvyPay admin SMTP tester.</p>
          <p style="color:#667085;font-size:12px;">If you received this, outbound mail is working.</p>
        </div>
      `,
    });

    logs.push({
      level: 'success',
      message: `Accepted: ${(info.accepted || []).join(', ') || to}`,
    });
    if (info.rejected?.length) {
      logs.push({
        level: 'error',
        message: `Rejected: ${info.rejected.join(', ')}`,
      });
    }
    if (info.response) {
      logs.push({ level: 'info', message: `Server response: ${info.response}` });
    }
    if (info.messageId) {
      logs.push({ level: 'info', message: `Message ID: ${info.messageId}` });
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent',
      messageId: info.messageId,
      logs,
    });
  } catch (error) {
    const errorLogs = sanitizeSmtpError(error);
    return NextResponse.json(
      {
        success: false,
        message: errorLogs[0]?.message || 'Failed to send test email',
        logs: [...logs, ...errorLogs],
      },
      { status: 500 }
    );
  }
}
