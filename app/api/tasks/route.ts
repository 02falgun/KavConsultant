import { NextResponse } from 'next/server';
import { getTasksPage } from '@/lib/services/crm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  const search = url.searchParams.get('search') ?? undefined;
  const scope = (url.searchParams.get('scope') ?? 'all') as 'all' | 'my' | 'team';
  const result = await getTasksPage({ page, pageSize, search, scope });
  return NextResponse.json(result);
}
