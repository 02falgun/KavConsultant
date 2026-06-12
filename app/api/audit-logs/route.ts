import { NextResponse } from 'next/server';
import { getAuditLogsPage } from '@/lib/services/crm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  const entityName = url.searchParams.get('entityName') ?? undefined;
  const actorUserId = url.searchParams.get('actorUserId') ?? undefined;
  const result = await getAuditLogsPage({ page, pageSize, entityName, actorUserId });
  return NextResponse.json(result);
}
