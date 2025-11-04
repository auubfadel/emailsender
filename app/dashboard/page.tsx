export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Total subscribers</div>
          <div className="text-2xl font-bold">—</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Active lists</div>
          <div className="text-2xl font-bold">—</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Campaigns sent</div>
          <div className="text-2xl font-bold">—</div>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-neutral-500 mb-2">Last 10 events</div>
        <div className="text-sm text-neutral-400">No data yet.</div>
      </div>
    </main>
  );
}

