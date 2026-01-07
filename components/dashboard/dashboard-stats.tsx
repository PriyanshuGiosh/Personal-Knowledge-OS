'use client';

import { FileText, Hash, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStatsProps {
  totalNotes: number;
  totalTags: number;
  recentEdits: number;
}

export function DashboardStats({ totalNotes, totalTags, recentEdits }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNotes}</div>
          <p className="text-xs text-muted-foreground">
            {totalNotes === 1 ? 'note in your knowledge base' : 'notes in your knowledge base'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tags Used</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTags}</div>
          <p className="text-xs text-muted-foreground">
            {totalTags === 1 ? 'unique tag' : 'unique tags'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentEdits}</div>
          <p className="text-xs text-muted-foreground">
            {recentEdits === 1 ? 'note edited recently' : 'notes edited recently'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}