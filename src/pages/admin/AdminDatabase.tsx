
import React from "react";
import { Database } from "lucide-react";

const AdminDatabase = () => (
  <div className="space-y-6 max-w-3xl">
    <h1 className="text-3xl font-bold flex items-center gap-2">
      <Database className="text-blue-600" /> Database Management
    </h1>
    <div className="rounded-lg bg-white shadow p-6 border border-blue-100">
      <p className="text-muted-foreground mb-4">
        View, search, and manage critical system database tables. Advanced operations coming soon.
      </p>
      <ul className="list-disc ml-6">
        <li>Live Table Viewer (Coming soon)</li>
        <li>Manual SQL Execution (Admin only)</li>
        <li>Backup/Restore Operations</li>
      </ul>
    </div>
  </div>
);

export default AdminDatabase;
</lov_write>

<lov-write file_path="src/pages/admin/AdminAuditLogs.tsx">
import React from "react";
import { FileSearch } from "lucide-react";

const AdminAuditLogs = () => (
  <div className="space-y-6 max-w-5xl">
    <h1 className="text-3xl font-bold flex items-center gap-2">
      <FileSearch className="text-amber-600" /> Audit Logs
    </h1>
    <div className="bg-white rounded-lg shadow p-6 border border-amber-100">
      <div className="mb-2 text-muted-foreground">
        Review all admin and organization-wide actions for security and compliance.
      </div>
      <table className="min-w-full text-left text-sm border">
        <thead>
          <tr>
            <th className="py-2 px-2 border-b">Date</th>
            <th className="py-2 px-2 border-b">User</th>
            <th className="py-2 px-2 border-b">Action</th>
            <th className="py-2 px-2 border-b">Table</th>
            <th className="py-2 px-2 border-b">Record ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-2 border-b">2025-06-15</td>
            <td className="py-2 px-2 border-b">admin@example.com</td>
            <td className="py-2 px-2 border-b">UPDATED</td>
            <td className="py-2 px-2 border-b">Hotels</td>
            <td className="py-2 px-2 border-b">3tb-18v</td>
          </tr>
          <tr>
            <td className="py-2 px-2 border-b">2025-06-14</td>
            <td className="py-2 px-2 border-b">auditor@yourapp.org</td>
            <td className="py-2 px-2 border-b">DELETED</td>
            <td className="py-2 px-2 border-b">Clients</td>
            <td className="py-2 px-2 border-b">7vc-22k</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-2 text-xs text-muted-foreground">Full log search coming soon.</div>
    </div>
  </div>
);

export default AdminAuditLogs;
</lov_write>

<lov-write file_path="src/pages/admin/AdminRoles.tsx">
import React from "react";
import { Shield } from "lucide-react";

const AdminRoles = () => (
  <div className="space-y-6 max-w-2xl">
    <h1 className="text-3xl font-bold flex items-center gap-2">
      <Shield className="text-blue-600" /> Roles & Permissions
    </h1>
    <div className="bg-white rounded-lg shadow p-6 border border-blue-100">
      <p className="mb-4 text-muted-foreground">
        Define, update, and manage access control for the system.
      </p>
      <ul className="list-disc ml-6">
        <li>Role Assignment UI (Coming soon)</li>
        <li>Custom Permissions Matrix</li>
        <li>Invite new system admins</li>
      </ul>
    </div>
  </div>
);

export default AdminRoles;
</lov_write>

<lov-write file_path="src/pages/admin/AdminMonitoring.tsx">
import React from "react";
import { MonitorDot } from "lucide-react";

const AdminMonitoring = () => (
  <div className="space-y-6 max-w-2xl">
    <h1 className="text-3xl font-bold flex items-center gap-2">
      <MonitorDot className="text-purple-600" /> Monitoring
    </h1>
    <div className="bg-white rounded-lg shadow p-6 border border-purple-100">
      <p className="mb-4 text-muted-foreground">
        Track system uptime, background tasks, and scheduled jobs. Monitoring integrations coming soon.
      </p>
      <ul className="list-disc ml-6">
        <li>Uptime Monitoring</li>
        <li>Background Job Status</li>
        <li>Integrated Alerts</li>
      </ul>
    </div>
  </div>
);

export default AdminMonitoring;
</lov_write>

