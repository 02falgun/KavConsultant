import { NextResponse } from 'next/server';
import { getStudentsPage } from '@/lib/services/crm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  const search = url.searchParams.get('search') ?? undefined;
  const status = url.searchParams.get('status') ?? undefined;
  const result = await getStudentsPage({ page, pageSize, search, status });
  return NextResponse.json(result);
}
