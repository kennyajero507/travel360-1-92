
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
