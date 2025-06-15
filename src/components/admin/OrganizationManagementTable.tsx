
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";
import { AlertCircle, Trash2, FileText } from "lucide-react";
import OrganizationAuditLogModal from "./OrganizationAuditLogModal";

interface OrgRow {
  id: string;
  name: string;
  owner_id: string | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  subscription_tier: string | null;
}

const OrganizationManagementTable = () => {
  const [organizations, setOrganizations] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditOrg, setAuditOrg] = useState<OrgRow | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load organizations");
      setOrganizations([]);
    } else {
      setOrganizations(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (org: OrgRow) => {
    if (org.deleted_at) {
      toast.info("This organization is already deleted.");
      return;
    }
    if (!window.confirm(`Soft delete organization "${org.name}"? This hides it from most views.`)) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("organizations")
      .update({
        deleted_at: now,
        deleted_by: user?.id ?? null,
      })
      .eq("id", org.id);

    if (error) {
      toast.error("Failed to delete organization");
      return;
    }

    // Log audit action
    await supabase.from("organization_audit_logs").insert([
      {
        org_id: org.id,
        action: "soft_delete",
        admin_id: user?.id ?? null,
        details: { org_name: org.name, deleted_at: now },
      }
    ]);
    toast.success("Organization soft-deleted.");
    fetchOrganizations();
  };

  return (
    <Card>
      <CardContent className="p-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading organizations...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length ? organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{org.subscription_tier || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {org.deleted_at ? (
                      <Badge className="bg-red-100 text-red-800">Deleted</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAuditOrg(org)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Audit Log
                    </Button>
                    {!org.deleted_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(org)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete organization"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No organizations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {/* Audit Log Modal */}
      {auditOrg && (
        <OrganizationAuditLogModal
          org={auditOrg}
          open={!!auditOrg}
          onOpenChange={() => setAuditOrg(null)}
        />
      )}
    </Card>
  );
};

export default OrganizationManagementTable;
