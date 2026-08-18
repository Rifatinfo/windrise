import { Footer } from "@/components/shared/footer/Footer";
import { Header } from "@/components/shared/navbar/Header";
import { LoginToastProvider } from "@/components/modules/auth/LoginToastProvider";
import { PageViewTracker } from "@/components/modules/analytics/PageViewTracker";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {

    return (
        <>
            <PageViewTracker />
            <LoginToastProvider />
            <Header/>
            {children}
            <Footer/>
        </>
    );
};

export default CommonLayout;