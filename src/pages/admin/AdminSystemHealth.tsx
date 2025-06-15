
import React from "react";

const AdminSystemHealth = () => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold">System Health</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div className="rounded-lg bg-white shadow p-5 flex flex-col gap-2 border border-green-100">
        <div className="font-semibold text-green-700">API Latency</div>
        <div className="text-2xl font-bold">52ms</div>
      </div>
      <div className="rounded-lg bg-white shadow p-5 flex flex-col gap-2 border border-blue-100">
        <div className="font-semibold text-blue-700">Database Status</div>
        <div className="text-2xl font-bold">OK</div>
      </div>
      <div className="rounded-lg bg-white shadow p-5 flex flex-col gap-2 border border-yellow-100">
        <div className="font-semibold text-yellow-700">Background Jobs</div>
        <div className="text-2xl font-bold">3 Running</div>
      </div>
    </div>
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">System Warnings</h2>
      <ul className="list-disc ml-6 text-yellow-700">
        <li>No warnings. All systems operational.</li>
      </ul>
    </div>
  </div>
);

export default AdminSystemHealth;
