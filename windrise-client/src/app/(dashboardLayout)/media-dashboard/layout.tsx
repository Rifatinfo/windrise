export default function MediaDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto container">
        {children}
    </div>
  );
}
