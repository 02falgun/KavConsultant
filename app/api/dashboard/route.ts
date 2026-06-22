import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getWorkspaceContext } from '@/lib/auth/workspace-context';

export async function GET(request: Request) {
  try {
    const context = await getWorkspaceContext();
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const countryFilter = searchParams.get('country') || null;
    const sourceFilter = searchParams.get('source') || null;
    const counsellorFilter = searchParams.get('counsellor') || null;
    const stageFilter = searchParams.get('stage') || null;

    // 1. Fetch Students
    let studentsQuery = supabase
      .from('students')
      .select('*')
      .eq('tenant_id', context.tenantId)
      .is('deleted_at', null);

    if (countryFilter) studentsQuery = studentsQuery.eq('preferred_country', countryFilter);
    if (sourceFilter) studentsQuery = studentsQuery.eq('source', sourceFilter);
    if (counsellorFilter) studentsQuery = studentsQuery.eq('assigned_counsellor_id', counsellorFilter);

    const { data: students, error: studentsErr } = await studentsQuery;

    // 2. Fetch Applications
    let appsQuery = supabase
      .from('applications')
      .select('*, programs(name), universities(name)')
      .eq('tenant_id', context.tenantId)
      .is('deleted_at', null);

    if (stageFilter) appsQuery = appsQuery.eq('status', stageFilter);
    if (counsellorFilter) appsQuery = appsQuery.eq('assigned_counsellor_id', counsellorFilter);

    const { data: applications, error: appsErr } = await appsQuery;

    // 3. Fetch Tasks
    let tasksQuery = supabase
      .from('tasks')
      .select('*')
      .eq('tenant_id', context.tenantId)
      .is('deleted_at', null);

    if (counsellorFilter) tasksQuery = tasksQuery.eq('assigned_user_id', counsellorFilter);

    const { data: tasks, error: tasksErr } = await tasksQuery;

    const studentList = (students || []) as any[];
    const applicationList = (applications || []) as any[];
    const taskList = (tasks || []) as any[];

    const totalStudents = studentList.length;

    // Real KPI aggregations (all naturally zero on a fresh workspace).
    const newLeads = studentList.filter((s: any) => s.status === 'new').length;
    const enrolledLeads = studentList.filter((s: any) => s.status === 'enrolled').length;
    const conversionRate = totalStudents > 0 ? Math.round((enrolledLeads / totalStudents) * 100) : 0;
    const activePipeline = applicationList.filter((a: any) => a.status !== 'enrolled' && a.status !== 'closed_lost').length;
    const wonApplications = applicationList.filter((a: any) => a.status === 'enrolled' || a.status === 'offer_received').length;

    const now = new Date();
    const overdueTasks = taskList.filter((t: any) => t.status !== 'done' && t.due_at && new Date(t.due_at) < now).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const staleLeads = studentList.filter(
      (s: any) => (s.status === 'new' || s.status === 'contacted') && new Date(s.updated_at) < thirtyDaysAgo
    ).length;

    // Lead source distribution (real aggregation).
    const sourceMap: Record<string, number> = {};
    studentList.forEach((s: any) => {
      const src = s.source || 'other';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const sourceBreakdown = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

    // Conversion rate by preferred destination (real aggregation).
    const countryTotals: Record<string, number> = {};
    const countryEnrolled: Record<string, number> = {};
    studentList.forEach((s: any) => {
      if (!s.preferred_country) return;
      countryTotals[s.preferred_country] = (countryTotals[s.preferred_country] || 0) + 1;
      if (s.status === 'enrolled') {
        countryEnrolled[s.preferred_country] = (countryEnrolled[s.preferred_country] || 0) + 1;
      }
    });
    const countryConversion = Object.entries(countryTotals).map(([country, total]) => ({
      country,
      rate: total > 0 ? Math.round(((countryEnrolled[country] || 0) / total) * 100) : 0,
    }));

    return NextResponse.json({
      kpis: {
        newLeads,
        conversionRate,
        slaCompliance: 0,
        avgResponseTime: '0m',
        activePipeline,
        wonApplications,
        overdueTasks,
        staleLeads,
      },
      charts: {
        pipelineTrend: [],
        sourceBreakdown,
        countryConversion,
        responseTimeDistribution: [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
