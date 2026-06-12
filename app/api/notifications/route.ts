import { NextResponse } from 'next/server';
import { getNotificationsPage } from '@/lib/services/crm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
  const result = await getNotificationsPage({ page, pageSize, unreadOnly });
  return NextResponse.json(result);
}
