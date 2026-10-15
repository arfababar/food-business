import { Link } from "react-router-dom";
import { Utensils, Home, ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-neutral-50">
      <SEO title="Page Not Found (404)" description="The page you are looking for does not exist." />
      <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 shadow-inner">
        <Utensils className="w-10 h-10" />
      </div>
      <span className="text-amber-600 font-black text-sm uppercase tracking-widest mb-1">404 Error</span>
      <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-2">Page Not Found</h1>
      <p className="text-neutral-500 max-w-sm mb-8 text-sm">
        The link you followed may be broken or the menu page may have moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-sm transition shadow-sm"
        >
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
        <Link
          to="/menu"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-2xl text-sm transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> View Delicious Menu
        </Link>
      </div>
    </div>
  );
}
