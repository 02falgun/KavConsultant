import { NextResponse } from 'next/server';
import { getStudentsPage, getStudentsPageCursor } from '@/lib/services/crm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? undefined;
  const status = url.searchParams.get('status') ?? undefined;
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);

  const cursorCreatedAt = url.searchParams.get('cursorCreatedAt') ?? undefined;
  const cursorId = url.searchParams.get('cursorId') ?? undefined;
  const page = url.searchParams.get('page');

  if (page && !cursorCreatedAt && !cursorId) {
    const result = await getStudentsPage({ page: Number(page), pageSize, search, status });
    return NextResponse.json(result);
  }

  const result = await getStudentsPageCursor({
    pageSize,
    search,
    status,
    cursorCreatedAt,
    cursorId,
  });
  return NextResponse.json(result);
}
