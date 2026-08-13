
import Inventory from "@/components/modules/inventory/Inventory";
import { thisMonthRange } from "@/components/modules/inventory/inventory.utils";
import { getInventoryOverview } from "@/services/inventory/inventory";

const InventoryPage = async () => {
    // Matches the dashboard's default "This Month" selection
    const { start, end } = thisMonthRange();
    const result = await getInventoryOverview({ start, end });

    if (!result?.success || !result.data) {
        return (
            <div className="mx-auto w-full max-w-[1440px] ">
                <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-card">
                    <p className="text-sm font-semibold text-ink">Inventory could not be loaded</p>
                    <p className="mt-1 text-sm text-subtle">
                        {result?.message || "Make sure the server is running, then refresh this page."}
                    </p>
                </div>
            </div>
        );
    }

    return <Inventory initialData={result.data} />;
}

export default InventoryPage;
