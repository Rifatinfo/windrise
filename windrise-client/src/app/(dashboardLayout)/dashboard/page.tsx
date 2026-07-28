"use client";

import { useAuth } from "@/hooks/use-auth";
import { getRoleLabel } from "@/utiles/user-utils";
import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  BarChart3,
  ImageIcon,
  UsersIcon,
  TrendingUpIcon,
  PackageIcon,
  DollarSignIcon,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`mt-1 text-xs font-medium ${
                changeType === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="1,234" icon={UsersIcon} change="+12% from last month" changeType="up" />
        <StatCard title="Total Orders" value="567" icon={ShoppingCartIcon} change="+8% from last month" changeType="up" />
        <StatCard title="Revenue" value="$45,678" icon={DollarSignIcon} change="+15% from last month" changeType="up" />
        <StatCard title="Products" value="89" icon={PackageIcon} change="+3 new this week" changeType="up" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { text: "New user registered: john@example.com", time: "2 min ago" },
              { text: "Order #1234 completed", time: "15 min ago" },
              { text: "Product 'Windbreaker Pro' updated", time: "1 hour ago" },
              { text: "Payment received: $299.00", time: "2 hours ago" },
              { text: "New shop manager added", time: "3 hours ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-gray-600">{item.text}</p>
                <span className="whitespace-nowrap text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
              <UsersIcon className="mb-2 h-5 w-5 text-gray-500" />
              Manage Users
            </button>
            <button className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
              <PackageIcon className="mb-2 h-5 w-5 text-gray-500" />
              Add Product
            </button>
            <button className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
              <BarChart3 className="mb-2 h-5 w-5 text-gray-500" />
              View Analytics
            </button>
            <button className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
              <LayoutDashboardIcon className="mb-2 h-5 w-5 text-gray-500" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Sales" value="$1,234" icon={DollarSignIcon} change="+5% vs yesterday" changeType="up" />
        <StatCard title="Pending Orders" value="23" icon={ShoppingCartIcon} change="5 urgent" />
        <StatCard title="Products" value="156" icon={PackageIcon} change="12 low stock" />
        <StatCard title="Staff Online" value="4/6" icon={UsersIcon} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h3>
          <div className="space-y-4">
            {[
              { id: "#ORD-1234", customer: "Alice Johnson", amount: "$89.00", status: "Processing" },
              { id: "#ORD-1233", customer: "Bob Smith", amount: "$156.00", status: "Shipped" },
              { id: "#ORD-1232", customer: "Carol White", amount: "$45.00", status: "Delivered" },
              { id: "#ORD-1231", customer: "David Brown", amount: "$210.00", status: "Processing" },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    order.status === "Delivered" ? "bg-green-100 text-green-700" :
                    order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: "Windbreaker Pro", sold: 45, revenue: "$4,050" },
              { name: "Classic Hoodie", sold: 38, revenue: "$2,660" },
              { name: "Sport Pants", sold: 32, revenue: "$1,920" },
              { name: "Urban Jacket", sold: 28, revenue: "$3,360" },
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sold} sold</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Media" value="342" icon={ImageIcon} change="+18 this week" changeType="up" />
        <StatCard title="Images" value="256" icon={ImageIcon} />
        <StatCard title="Videos" value="48" icon={LayoutDashboardIcon} />
        <StatCard title="Storage Used" value="12.4 GB" icon={PackageIcon} change="68% of 20GB" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Uploads</h3>
          <div className="space-y-4">
            {[
              { name: "hero-banner-v3.jpg", type: "Image", size: "2.4 MB", time: "10 min ago" },
              { name: "product-showcase.mp4", type: "Video", size: "45.2 MB", time: "1 hour ago" },
              { name: "logo-white.png", type: "Image", size: "156 KB", time: "2 hours ago" },
              { name: "promo-banner.jpg", type: "Image", size: "1.8 MB", time: "3 hours ago" },
            ].map((file, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    {file.type === "Video" ? (
                      <LayoutDashboardIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.type} - {file.size}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{file.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Media by Category</h3>
          <div className="space-y-4">
            {[
              { category: "Product Images", count: 142, percent: 42 },
              { category: "Banners", count: 56, percent: 16 },
              { category: "Social Media", count: 89, percent: 26 },
              { category: "Other", count: 55, percent: 16 },
            ].map((cat, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">{cat.category}</p>
                  <p className="text-sm text-gray-500">{cat.count}</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Access denied</p>
        </div>
      </div>
    );
  }

  const roleLabel = getRoleLabel(user.role);

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {roleLabel} Dashboard - Here&apos;s what&apos;s happening today
        </p>
      </div>

      {user.role === "ADMIN" && <AdminDashboard />}
      {user.role === "SHOP_MANAGER" && <ShopManagerDashboard />}
      {user.role === "MEDIA_MANAGER" && <MediaManagerDashboard />}
    </div>
  );
};

export default DashboardPage;
