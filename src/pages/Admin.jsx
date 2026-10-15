import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { getProducts } from "../services/api";
import { BUSINESS_CONFIG } from "../config/business";
import { 
  ShoppingBag, 
  Package, 
  Tag, 
  LogOut, 
  Phone, 
  MessageCircle, 
  Lock, 
  Mail,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "products" | "promos"

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Products State
  const [productsList, setProductsList] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState([]);

  // 1. Session check on mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session);
          setAuthLoading(false);
        }
      } else {
        // If Supabase not yet configured, check local admin demo session
        const localAdmin = localStorage.getItem("baba_hafeez_admin_session");
        if (isMounted) {
          setSession(localAdmin ? JSON.parse(localAdmin) : null);
          setAuthLoading(false);
        }
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Data when session or activeTab changes
  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    async function loadAdminData() {
      if (activeTab === "orders") {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });
          if (isMounted) {
            if (data) setOrders(data);
            setOrdersLoading(false);
          }
        } else {
          await Promise.resolve();
          const saved = localStorage.getItem("latest_order");
          if (isMounted) {
            setOrders(saved ? [JSON.parse(saved)] : []);
            setOrdersLoading(false);
          }
        }
      } else if (activeTab === "products") {
        const { data } = await getProducts();
        if (isMounted) {
          setProductsList(data);
          setProductsLoading(false);
        }
      } else if (activeTab === "promos") {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.from("promo_codes").select("*");
          if (isMounted && data) setPromoCodes(data);
        } else {
          await Promise.resolve();
          if (isMounted) {
            setPromoCodes([{ id: 1, code: "WELCOME10", percent_off: 10, is_active: true }]);
          }
        }
      }
    }

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, [session, activeTab]);

  const refreshOrders = async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
    }
  };

  const refreshProducts = async () => {
    const { data } = await getProducts();
    if (data) setProductsList(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setSession(data.session);
      } else {
        // Demo admin credential when testing without Supabase connection
        if (email === "admin@babahafeez.com" && password === "admin123") {
          const fakeSession = { user: { email }, access_token: "demo-token" };
          localStorage.setItem("baba_hafeez_admin_session", JSON.stringify(fakeSession));
          setSession(fakeSession);
        } else {
          throw new Error("Invalid admin credentials. Use admin@babahafeez.com / admin123 for demo mode, or connect Supabase.");
        }
      }
    } catch (err) {
      setLoginError(err.message || "Failed to log in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("baba_hafeez_admin_session");
    setSession(null);
  };


  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      refreshOrders();
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId || o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  // Toggle Product Availability
  const handleToggleProductAvailability = async (productId, currentStatus) => {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("products")
        .update({ is_available: !currentStatus })
        .eq("id", productId);
      refreshProducts();
    } else {
      setProductsList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: !currentStatus } : p))
      );
    }
  };

  // Filtered orders
  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  // Loading Session Screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Login Screen if unauthenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 text-neutral-950 font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
            BH
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Admin Portal</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {BUSINESS_CONFIG.name} Management Dashboard ({BUSINESS_CONFIG.city})
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-neutral-900 py-8 px-6 sm:px-10 rounded-3xl border border-neutral-800 shadow-2xl">
            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@babahafeez.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Admin Portal"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
              <Link to="/" className="text-xs font-semibold text-neutral-400 hover:text-amber-400 transition">
                ← Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg text-white">
              BABA <span className="text-amber-500">HAFEEZ</span>
            </span>
            <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-400 hidden sm:inline">
              Logged in as <strong>{session.user?.email || "Admin"}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900 text-neutral-300 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "orders"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "products"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Menu & Products ({productsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("promos")}
            className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "promos"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promo Codes</span>
          </button>
        </div>
      </div>

      {/* Main Admin Tab View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-neutral-900">Live Customer Orders</h1>
                <p className="text-xs text-neutral-500">Manage incoming orders, delivery dispatch, and status</p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold bg-white cursor-pointer"
                >
                  <option value="all">All Orders</option>
                  <option value="new">New</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {ordersLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-500">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-bold text-neutral-800">No orders found</h3>
                <p className="text-xs text-neutral-500 mt-1">Orders placed by customers will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord, idx) => {
                  const orderNumber = ord.order_number || ord.orderId;
                  const customer = ord.customer_name ? {
                    fullName: ord.customer_name,
                    phone: ord.phone,
                    address: ord.address,
                    area: ord.area,
                    city: ord.city,
                  } : ord.customer;
                  const total = ord.total;
                  const status = ord.status;

                  return (
                    <div
                      key={ord.id || ord.orderId || idx}
                      className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col lg:flex-row gap-6 justify-between items-start"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-neutral-900">
                            #{orderNumber}
                          </span>
                          <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                            status === "out_for_delivery" ? "bg-blue-100 text-blue-800" :
                            status === "preparing" ? "bg-amber-100 text-amber-800" :
                            status === "cancelled" ? "bg-rose-100 text-rose-800" :
                            "bg-purple-100 text-purple-800"
                          }`}>
                            {status}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(ord.created_at || ord.createdAt || "2026-10-15T00:00:00Z").toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="text-sm">
                          <strong className="text-neutral-900">{customer?.fullName}</strong> •{" "}
                          <span className="text-neutral-600">{customer?.phone}</span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {customer?.address}, {customer?.area}, {customer?.city || BUSINESS_CONFIG.city}
                        </div>

                        {/* Items list */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-neutral-400 block mb-1">Items:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(ord.items || []).map((itm, i) => (
                              <span key={i} className="text-xs bg-neutral-100 px-2.5 py-1 rounded-lg font-medium text-neutral-800">
                                {itm.quantity}x {itm.product?.name || itm.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions & Total */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-100">
                        <div className="text-right">
                          <span className="text-xs text-neutral-400 block">Total (COD)</span>
                          <span className="text-2xl font-black text-amber-600">Rs. {Number(total).toLocaleString()}</span>
                        </div>

                        {/* Status Change Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-500">Change Status:</span>
                          <select
                            value={status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id || ord.orderId, e.target.value)}
                            className="text-xs font-bold px-3 py-2 rounded-xl border border-neutral-300 bg-white cursor-pointer"
                          >
                            <option value="new">New</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Quick Contact Buttons */}
                        <div className="flex gap-2">
                          <a
                            href={`tel:${customer?.phone}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-600" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${customer?.phone?.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(customer?.fullName || "")},%20this%20is%20Baba%20Hafeez%20regarding%20your%20Order%20${orderNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-neutral-900">Menu & Product Management</h1>
                <p className="text-xs text-neutral-500">Manage item pricing, availability, and menu items</p>
              </div>
            </div>

            {productsLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs divide-y divide-neutral-100">
                {productsList.map((product) => (
                  <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-2xl object-cover bg-neutral-100"
                      />
                      <div>
                        <h4 className="font-bold text-base text-neutral-900">{product.name}</h4>
                        <span className="text-xs uppercase tracking-wider text-amber-600 font-bold">
                          {product.category}
                        </span>
                        <p className="text-xs text-neutral-400 line-clamp-1">{product.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-black text-lg text-neutral-900">Rs. {product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through block">
                            Rs. {product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Availability toggle */}
                      <button
                        onClick={() => handleToggleProductAvailability(product.id, product.is_available !== false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          product.is_available !== false
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                      >
                        {product.is_available !== false ? "In Stock" : "Sold Out"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROMO CODES */}
        {activeTab === "promos" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-neutral-900">Promo Codes Management</h1>
              <p className="text-xs text-neutral-500">Server-side validated discount codes (currently disabled for customers)</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs divide-y divide-neutral-100">
              {promoCodes.map((promo) => (
                <div key={promo.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-neutral-900">{promo.code}</span>
                    <span className="text-xs text-neutral-500 ml-2">({promo.percent_off}% OFF)</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${promo.is_active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-600"}`}>
                    {promo.is_active ? "Active" : "Disabled"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
