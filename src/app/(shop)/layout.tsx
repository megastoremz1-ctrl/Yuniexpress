import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
