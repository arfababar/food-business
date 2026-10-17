import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../data/products";
import { getProducts } from "../services/api";
import { BUSINESS_CONFIG } from "../config/business";
import ProductCard from "../components/ProductCard";
import { Search, SlidersHorizontal, Utensils, X, Loader2 } from "lucide-react";

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const { data } = await getProducts();
        if (isMounted) setProductsList(data);
      } catch (err) {
        console.error("Error loading products in Menu", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryChange = (catId) => {
    if (catId === "all") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // Filter by Category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [activeCategory, searchQuery, sortBy, productsList]);

  return (
    <div className="bg-neutral-50 min-h-screen py-4 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header Title (Hidden or very compact on mobile) */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-10 hidden sm:block">
          <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest block mb-1">
            Delicious & Fresh
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Explore Our Menu
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            Every burger, side, and deal is freshly prepared upon your order in {BUSINESS_CONFIG.city} with prime ingredients.
          </p>
        </div>

        {/* Filter and Search Controls Bar */}
        <div className="mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
          {/* Search Input & Sort */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-5 border border-neutral-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search for burgers, deals, loaded fries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-neutral-50 border border-neutral-200 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm font-medium transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-neutral-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto py-2 px-3 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-800 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sticky Category Tabs (Sticky under navbar at top-16 on mobile, top-20 on desktop) */}
          <div className="sticky top-16 sm:top-20 z-30 bg-neutral-50/95 backdrop-blur-md -mx-3 px-3 sm:mx-0 sm:px-0 py-1.5 sm:py-2 border-b border-neutral-200/60 sm:border-none shadow-xs sm:shadow-none">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 sm:py-1">
              {CATEGORIES.map((cat) => {
                const count =
                  cat.id === "all"
                    ? productsList.length
                    : productsList.filter((p) => p.category === cat.id).length;
                const isSelected = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 ${
                      isSelected
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                        isSelected
                          ? "bg-amber-500 text-neutral-900"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-3 sm:mb-6 px-1">
          <p className="text-xs text-neutral-500 font-medium">
            Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> items
            {searchQuery && (
              <span> matching "<span className="text-neutral-800">{searchQuery}</span>"</span>
            )}
          </p>
          {(activeCategory !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchParams({});
              }}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Product Grid / Loading */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-neutral-600">Loading fresh menu items...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 my-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-1">No items found</h3>
            <p className="text-xs text-neutral-500 mb-6">
              We couldn't find any dishes matching your search. Try adjusting your query or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchParams({});
              }}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition cursor-pointer"
            >
              Show All Menu Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}