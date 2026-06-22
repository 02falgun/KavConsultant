import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthRole } from '@/lib/constants/auth';

export type ProtectedApiContext = {
  userId: string;
  tenantId: string;
  role: AuthRole;
  params?: any;
};

export type ProtectedApiHandler = (
  request: Request,
  context: ProtectedApiContext
) => Promise<Response> | Response;

/**
 * Reusable wrapper function to protect Next.js API route endpoints.
 * Validates Supabase auth session, checks tenant membership, and enforces optional role guards.
 *
 * @param handler The API handler function to execute if authorized
 * @param allowedRoles Optional list of roles allowed to access this endpoint
 */
export function withProtectedApi(
  handler: ProtectedApiHandler,
  allowedRoles?: AuthRole[]
) {
  return async (request: Request, segmentContext?: { params?: any }) => {
    try {
      const supabase = await createSupabaseServerClient();

      // 1. Verify User Authentication Session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized: Session invalid or expired' },
          { status: 401 }
        );
      }

      // 2. Fetch Active Workspace Tenant Membership
      const { data: membership, error: memberError } = await supabase
        .from('memberships')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle();

      if (memberError || !membership) {
        return NextResponse.json(
          { error: 'Forbidden: No active workspace membership found for this user' },
          { status: 403 }
        );
      }

      const role = membership.role as AuthRole;

      // 3. Verify Role Authorization Policies
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return NextResponse.json(
          { error: `Forbidden: Access restricted. Required role: ${allowedRoles.join(', ')}` },
          { status: 403 }
        );
      }

      // 4. Proceed to actual API Route Handler with Context
      return await handler(request, {
        userId: user.id,
        tenantId: membership.tenant_id,
        role,
        params: segmentContext?.params
      });
    } catch (error: any) {
      console.error('API protection wrapper encountered an error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
