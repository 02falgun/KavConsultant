import { NextResponse } from 'next/server';
import { getUniversities } from '@/lib/services/crm';

export async function GET() {
  try {
    const result = await getUniversities();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
