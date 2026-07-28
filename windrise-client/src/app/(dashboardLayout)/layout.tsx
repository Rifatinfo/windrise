

import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { Header } from "@/components/sidebar/Header";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import LogoutSuccessToast from "@/components/modules/auth/LogoutSuccessToast";

import { ReactNode, Suspense } from "react";
const DashboardLayout = ({children} : {children : ReactNode}) => {
    return (
        <div>
            <Suspense>
                <LogoutSuccessToast />
            </Suspense>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar  />
                <SidebarInset>
                    <Header />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ">
                                {children}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
};

export default DashboardLayout;