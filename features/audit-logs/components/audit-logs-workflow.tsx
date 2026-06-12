"use client";

import { useState } from 'react';
import {
  History,
  Search,
  ChevronDown,
  ChevronUp,
  Terminal,
  User,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuditLogs } from '@/hooks/use-audit-logs';

export function AuditLogsWorkflow() {
  const { data, isLoading } = useAuditLogs();
  const logs = data?.items ?? [];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchEntity, setSearchEntity] = useState('');
  const [searchAction, setSearchAction] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredLogs = logs.filter((log: any) => {
    const matchEntity = searchEntity ? log.entity_name.toLowerCase().includes(searchEntity.toLowerCase()) : true;
    const matchAction = searchAction ? log.action.toLowerCase().includes(searchAction.toLowerCase()) : true;
    return matchEntity && matchAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'insert':
      case 'import':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400';
      case 'update':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400';
      case 'delete':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400';
      case 'login':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <History className="h-7 w-7 text-indigo-500" />
          <span>Security Audit Trail</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Immutable security logs. Track creations, modifications, deletions, role updates, and authentication events.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchEntity}
            onChange={(e) => setSearchEntity(e.target.value)}
            placeholder="Filter by entity type (e.g. students, applications)..."
            className="pl-9 h-9 text-xs rounded-lg"
          />
        </div>
        <select
          value={searchAction}
          onChange={(e) => setSearchAction(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="insert">INSERT</option>
          <option value="update">UPDATE</option>
          <option value="delete">DELETE</option>
          <option value="login">LOGIN</option>
          <option value="invite">INVITE</option>
          <option value="export">EXPORT</option>
        </select>
      </div>

      {/* Activity table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-900">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-500" />
            <span>Workspace Operations Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-9 w-9 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-md font-bold text-slate-900 dark:text-slate-50">No logs recorded</h3>
              <p className="text-sm text-slate-400 max-w-xs mt-1">
                No security actions matched your filter parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-left">
                    <th className="py-3 px-4 w-52">Timestamp</th>
                    <th className="py-3 px-4">Operator User</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {filteredLogs.map((log: any) => {
                    const isExpanded = expandedId === log.id;
                    return (
                      <>
                        <tr
                          key={log.id}
                          onClick={() => toggleExpand(log.id)}
                          className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30 cursor-pointer"
                        >
                          <td className="py-4 px-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(log.created_at).toLocaleString()}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>{log.users?.full_name || log.users?.email || 'System'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5 text-slate-400" />
                              <span>{log.entity_name}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50/60 dark:bg-slate-900/20">
                            <td colSpan={5} className="py-4 px-6 border-t border-slate-100 dark:border-slate-900">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                  <div>
                                    <p className="text-slate-400 font-bold uppercase mb-1">Before Data:</p>
                                    <pre className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto max-h-48 text-slate-700 dark:text-slate-300">
                                      {log.before_data ? JSON.stringify(log.before_data, null, 2) : 'null'}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 font-bold uppercase mb-1">After Data:</p>
                                    <pre className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto max-h-48 text-slate-700 dark:text-slate-300">
                                      {log.after_data ? JSON.stringify(log.after_data, null, 2) : 'null'}
                                    </pre>
                                  </div>
                                </div>
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                  <div className="text-xs font-mono">
                                    <p className="text-slate-400 font-bold uppercase mb-1">Request Context:</p>
                                    <pre className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto max-h-32 text-slate-700 dark:text-slate-300">
                                      {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
