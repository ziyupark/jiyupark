export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Full-screen overlay — covers the root layout's Nav/Footer
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ background: "#0D0D0D" }}>
      {children}
    </div>
  );
}
