import { NextResponse } from 'next/server';
import { getPrograms } from '@/lib/services/crm';

export async function GET() {
  try {
    const result = await getPrograms();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
