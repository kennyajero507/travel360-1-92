
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { supabase } from "../../integrations/supabase/client";
import { AlertCircle } from "lucide-react";

interface OrganizationAuditLogModalProps {
  org: { id: string; name: string };
  open: boolean;
  onOpenChange: () => void;
}

interface AuditLogRow {
  id: string;
  action: string;
  admin_id: string | null;
  details: any;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  soft_delete: "Soft Deleted",
  create: "Created",
  update: "Updated",
};

const OrganizationAuditLogModal: React.FC<OrganizationAuditLogModalProps> = ({
  org,
  open,
  onOpenChange,
}) => {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org.id, open]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("organization_audit_logs")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });
    if (error) {
      setLogs([]);
    } else {
      setLogs(data as AuditLogRow[] || []);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Log for: <span className="text-blue-700">{org.name}</span></DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <AlertCircle className="h-6 w-6 text-gray-400" />
            <span className="text-gray-500 text-sm">No logs found for this organization.</span>
          </div>
        ) : (
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>By (admin id)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">{actionLabels[log.action] || log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{log.admin_id || "N/A"}</span>
                    </TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationAuditLogModal;
