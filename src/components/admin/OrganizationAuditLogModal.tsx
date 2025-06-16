
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { supabase } from '../../integrations/supabase/client';
import { FileText, Calendar, User } from 'lucide-react';

interface OrgAuditLog {
  id: string;
  action: string;
  created_at: string;
  admin_id: string | null;
  details: any;
}

interface OrganizationAuditLogModalProps {
  org: {
    id: string;
    name: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrganizationAuditLogModal = ({ org, open, onOpenChange }: OrganizationAuditLogModalProps) => {
  const [logs, setLogs] = useState<OrgAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && org.id) {
      fetchAuditLogs();
    }
  }, [open, org.id]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_audit_logs')
        .select('*')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'created':
        return <Badge className="bg-green-100 text-green-800">Created</Badge>;
      case 'updated':
        return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
      case 'deleted':
      case 'soft_delete':
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Log - {org.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No audit logs found for this organization.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {log.admin_id || 'System'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {log.details ? JSON.stringify(log.details) : 'No details'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationAuditLogModal;
