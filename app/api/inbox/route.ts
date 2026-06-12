import { NextResponse } from 'next/server';
import { getInboxPage } from '@/lib/services/crm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  const filter = url.searchParams.get('filter') as any;
  const result = await getInboxPage({ page, pageSize, filter });
  return NextResponse.json(result);
}
