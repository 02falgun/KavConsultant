import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { withProtectedApi } from '@/lib/auth/api-protection';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Mock Supabase Server Client factory
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe('API Protection Wrapper (withProtectedApi)', () => {
  let mockSupabase: any;
  const dummyHandler = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    dummyHandler.mockImplementation(() => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase);
  });

  it('should return 401 Unauthorized if auth session is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const wrapped = withProtectedApi(dummyHandler);
    const request = new Request('http://localhost/api/leads');
    const response = await wrapped(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Unauthorized');
  });

  it('should return 403 Forbidden if user has no active tenant membership', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

    const wrapped = withProtectedApi(dummyHandler);
    const request = new Request('http://localhost/api/leads');
    const response = await wrapped(request);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain('Forbidden');
  });

  it('should return 403 Forbidden if user role is not authorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockSupabase.maybeSingle.mockResolvedValue({
      data: { tenant_id: 'tenant-999', role: 'counsellor' },
      error: null,
    });

    const wrapped = withProtectedApi(dummyHandler, ['admin']);
    const request = new Request('http://localhost/api/leads');
    const response = await wrapped(request);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain('restricted');
  });

  it('should call handler and return 200 OK if auth session and role match', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockSupabase.maybeSingle.mockResolvedValue({
      data: { tenant_id: 'tenant-999', role: 'admin' },
      error: null,
    });

    const wrapped = withProtectedApi(dummyHandler, ['admin']);
    const request = new Request('http://localhost/api/leads');
    const response = await wrapped(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(dummyHandler).toHaveBeenCalled();
  });
});
