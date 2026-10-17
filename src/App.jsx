import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./context/CartProvider";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

// Code-split pages for high performance
const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsRefund = lazy(() => import("./pages/TermsRefund"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Page transition loader
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 text-center">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
      <span className="text-xs font-bold text-neutral-500">Loading Baba Hafeez...</span>
    </div>
  );
}

// Automatically scrolls window to top on page change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function MainLayout() {
  const isDevOffline = import.meta.env.DEV && (!isSupabaseConfigured || !supabase);

  return (
    <div className="flex flex-col min-h-screen">
      {isDevOffline && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-1 text-center text-xs font-black tracking-wider uppercase z-50">
          OFFLINE DEMO MODE (DEV ONLY)
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-refund" element={<TermsRefund />} />
            {/* 404 handler */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <CartProvider>
            <ScrollToTop />
            <MainLayout />
          </CartProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}