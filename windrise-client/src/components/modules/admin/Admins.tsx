"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2Icon, PlusIcon, SearchIcon, UserRoundCheckIcon } from "lucide-react";
import Swal from "sweetalert2";
import type { Admin, AdminStatus } from "@/types/admin";
import {
  createStaff,
  deleteAdmin,
  getAllAdmins,
  updateAdmin,
  updateAdminStatus,
} from "@/services/admin/admin";
import { STAFF_ROLES, type StaffRoleKey } from "@/types/staffRole";
import { useAuth } from "@/hooks/use-auth";
import { AdminsTable } from "./AdminsTable";
import { AdminFormDialog, type AdminFormPayload } from "./AdminFormDialog";
import { Toast } from "@/components/shared/Toast/Toast";

/**
 * One screen for every staff role. The role config supplies the labels and
 * the create endpoint, so Add Admin / Shop Manager / Media Manager /
 * Customer Support all behave identically.
 */
export function Admins({ roleKey = "ADMIN" }: { roleKey?: StaffRoleKey }) {
  const config = STAFF_ROLES[roleKey];
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchAll = async () => {
    try {
      const result = await getAllAdmins({
        role: roleKey,
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setAdmins(result.data ?? []);
      setError("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : `Failed to load ${config.plural}`;
      setError(message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [roleKey]);

  const refresh = () => {
    setRefreshing(true);
    setError("");
    fetchAll();
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return admins;
    return admins.filter(
      (admin) =>
        admin.name?.toLowerCase().includes(needle) ||
        admin.email?.toLowerCase().includes(needle) ||
        admin.id.toLowerCase().includes(needle)
    );
  }, [admins, query]);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditing(admin);
    setFormError("");
    setFormOpen(true);
  };

  const handleSubmit = async (payload: AdminFormPayload) => {
    setSubmitting(true);
    setFormError("");
    try {
      if (editing) {
        await updateAdmin(editing.id, { name: payload.name, email: payload.email }, payload.file);
        Toast.fire({ icon: "success", title: `${config.singular} updated successfully!` });
      } else {
        await createStaff(
          roleKey,
          { name: payload.name, email: payload.email, password: payload.password ?? "" },
          payload.file
        );
        Toast.fire({ icon: "success", title: `${config.singular} created successfully!` });
      }
      setFormOpen(false);
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (admin: Admin, status: AdminStatus) => {
    const activating = status === "ACTIVE";
    Swal.fire({
      icon: "question",
      title: activating
        ? `Activate ${config.singular.toLowerCase()}?`
        : `Deactivate ${config.singular.toLowerCase()}?`,
      text: activating
        ? `${admin.name ?? `This ${config.singular.toLowerCase()}`} will be able to sign in again.`
        : `${admin.name ?? `This ${config.singular.toLowerCase()}`} will not be able to sign in until reactivated.`,
      showCancelButton: true,
      confirmButtonText: activating ? "Activate" : "Deactivate",
      cancelButtonText: "Cancel",
      confirmButtonColor: activating ? "#10b981" : "#f59e0b",
      buttonsStyling: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await updateAdminStatus(admin.id, status);
        Toast.fire({
          icon: "success",
          title: activating
            ? `${config.singular} activated!`
            : `${config.singular} deactivated.`,
        });
        refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update status";
        Toast.fire({ icon: "error", title: message });
      }
    });
  };

  const handleDelete = (admin: Admin) => {
    Swal.fire({
      icon: "warning",
      title: `Delete ${config.singular.toLowerCase()}?`,
      text: `${admin.name ?? `This ${config.singular.toLowerCase()}`} will be permanently removed. This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      buttonsStyling: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await deleteAdmin(admin.id);
        Toast.fire({ icon: "success", title: `${config.singular} deleted.` });
        refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : `Failed to delete ${config.singular.toLowerCase()}`;
        Toast.fire({ icon: "error", title: message });
      }
    });
  };

  return (
    <main className="min-h-full w-full px-4 py-6 lg:px-8">
      <div className="mx-auto mb-8 flex max-w-[1440px] flex-col gap-4">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
              Dashboards / <span className="font-medium text-ink">Admin Role</span> /{" "}
              <span className="font-medium text-ink">{config.navLabel}</span>
            </nav>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
              {config.heading}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {config.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-ink-muted">
              <UserRoundCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {admins.length} {config.plural}
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={loading || refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-card transition-colors duration-150 hover:border-slate-300 disabled:opacity-60"
            >
              <Loader2Icon
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-card transition-colors duration-150 hover:bg-brand/90"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              {config.navLabel}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl bg-surface py-16">
            <Loader2Icon className="h-6 w-6 animate-spin text-ink-soft" />
            <p className="text-sm text-ink-muted">Loading {config.plural}...</p>
          </div>
        ) : (
          <div
            aria-busy={refreshing}
            className={`flex flex-col gap-4 transition-opacity duration-200 ${refreshing ? "pointer-events-none opacity-60 " : ""}`}
          >
            <div className="relative w-full max-w-sm">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email or ID..."
                aria-label={`${`Search ${config.plural}`}`}
                className="h-10 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-ink-soft outline-none transition-colors duration-150 focus:border-brand"
              />
            </div>

            <AdminsTable
              admins={filtered}
              roleLabel={config.singular}
              rolePlural={config.plural}
              currentUserId={user?.id}
              serialOf={(admin) => admins.findIndex((item) => item.id === admin.id) + 1}
              onEdit={openEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      {formOpen && (
        <AdminFormDialog
          admin={editing}
          submitting={submitting}
          error={formError}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          roleLabel={config.singular}
        />
      )}
    </main>
  );
}
