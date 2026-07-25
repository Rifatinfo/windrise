import { Footer } from "@/components/shared/footer/Footer";
import { Header } from "@/components/shared/navbar/Header";


const CommonLayout = ({ children }: { children: React.ReactNode }) => {

    return (
        <>
            <Header/>
            {children}
            <Footer/>
        </>
    );
};

export default CommonLayout;