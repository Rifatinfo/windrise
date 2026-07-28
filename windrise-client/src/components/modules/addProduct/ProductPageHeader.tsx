import { ArrowLeft, Eye, Save } from "lucide-react";

const ProductPageHeader = () => {
    return (
        <div>
            {/* Page Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">
                                Add New Product
                            </h1>
                            <p className="text-xs text-slate-500">
                                Fill in the details to create a new product listing
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <Eye className="w-4 h-4" /> Preview
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm">
                            <Save className="w-4 h-4" /> Save Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductPageHeader;