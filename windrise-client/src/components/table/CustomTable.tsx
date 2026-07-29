import { ReactNode } from "react";

interface CustomTableProps {
  headers: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

const CustomTable = ({ headers, children, footer }: CustomTableProps) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {headers}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>

      {/* Footer (Pagination) */}
      {footer}
    </div>
  );
};

export default CustomTable;