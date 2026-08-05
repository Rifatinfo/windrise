import { LoginToastProvider } from "@/components/modules/auth/LoginToastProvider";
import { Footer } from "@/components/shared/footer/Footer";
import { Header } from "@/components/shared/navbar/Header";

const ShopLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <LoginToastProvider />
            <Header />
            {children}
            <Footer />
        </>
    );
};

export default ShopLayout;
