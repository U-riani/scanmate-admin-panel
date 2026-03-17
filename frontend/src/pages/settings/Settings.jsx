export default function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="page-title">System Settings</h1>
      <div className="glass-card p-6">
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Only Super Admin can access this page.
        </p>
      </div>
    </div>
  );
}
