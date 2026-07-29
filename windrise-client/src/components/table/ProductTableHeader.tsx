const ProductTableHeader = () => {
  return (
    <tr className="bg-slate-50 border-b border-slate-200">
      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Product
      </th>
      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Category
      </th>
      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Sub Category
      </th>
      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Price
      </th>
      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Stock
      </th>
      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
        Actions
      </th>
    </tr>
  );
};

export default ProductTableHeader;