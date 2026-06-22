import { NextResponse } from 'next/server';
import { getInboxPageCursor } from '@/lib/services/crm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cursorParam = url.searchParams.get('cursor');
  const cursor = cursorParam !== null && cursorParam !== 'undefined' && cursorParam !== 'null' ? Number(cursorParam) : undefined;
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  const filter = url.searchParams.get('filter') as any;
  const result = await getInboxPageCursor({ pageSize, cursor, filter });
  return NextResponse.json(result);
}
