import { NextResponse } from 'next/server';
import { getApplicationsPage } from '@/lib/services/crm';
import type { ApplicationPipelineStage } from '@/lib/workflow/stages';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  const search = url.searchParams.get('search') ?? undefined;
  const stage = url.searchParams.get('stage');
  const result = await getApplicationsPage({ page, pageSize, search, stage: stage ? (stage as ApplicationPipelineStage) : undefined });
  return NextResponse.json(result);
}
