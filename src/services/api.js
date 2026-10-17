import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { products as fallbackProducts } from "../data/products";

/**
 * Resolves a safe local image path for a product.
 * If image_url is missing or starts with "http" or "//", it replaces it
 * with the matching local image from products.js (by id, then by name).
 * If no match is found, falls back to /images/placeholder.svg.
 */
export function resolveProductImage(imageUrl, id, name) {
  const isRemoteOrMissing =
    !imageUrl ||
    typeof imageUrl !== "string" ||
    imageUrl.trim() === "" ||
    imageUrl.trim().startsWith("http://") ||
    imageUrl.trim().startsWith("https://") ||
    imageUrl.trim().startsWith("//");

  if (!isRemoteOrMissing) {
    return imageUrl.trim();
  }

  // 1. Match by id
  const matchById = fallbackProducts.find((p) => p.id === id);
  if (matchById?.image && !matchById.image.startsWith("http://") && !matchById.image.startsWith("https://") && !matchById.image.startsWith("//")) {
    return matchById.image;
  }

  // 2. Match by name (case-insensitive)
  if (name && typeof name === "string") {
    const cleanName = name.trim().toLowerCase();
    const matchByName = fallbackProducts.find(
      (p) => p.name && p.name.trim().toLowerCase() === cleanName
    );
    if (matchByName?.image && !matchByName.image.startsWith("http://") && !matchByName.image.startsWith("https://") && !matchByName.image.startsWith("//")) {
      return matchByName.image;
    }
  }

  // 3. Fallback placeholder
  return "/images/placeholder.svg";
}

/**
 * Fetch products from Supabase, or fall back to local dataset if unavailable.
 */
export async function getProducts() {
  if (!isSupabaseConfigured || !supabase) {
    const safeFallback = fallbackProducts.map((p) => ({
      ...p,
      image: resolveProductImage(p.image, p.id, p.name),
    }));
    return { data: safeFallback, isFallback: true };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Could not fetch products from Supabase, using local fallback.", error);
      const safeFallback = fallbackProducts.map((p) => ({
        ...p,
        image: resolveProductImage(p.image, p.id, p.name),
      }));
      return { data: safeFallback, isFallback: true };
    }

    // Map database fields to application shape
    const formatted = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      description: item.description,
      image: resolveProductImage(item.image_url, item.id, item.name),
      badge: item.badge,
      prepTime: item.prep_time || "15-20 mins",
      spicyLevel: item.spicy_level || "Regular",
      isFeatured: Boolean(item.is_featured),
    }));

    return { data: formatted, isFallback: false };
  } catch (err) {
    console.error("Network error fetching products:", err);
    const safeFallback = fallbackProducts.map((p) => ({
      ...p,
      image: resolveProductImage(p.image, p.id, p.name),
    }));
    return { data: safeFallback, isFallback: true };
  }
}

/**
 * Server-side order placement using RPC `place_order`.
 * Recalculates all line item prices and delivery rules on the database.
 */
export async function createOrder({ customer, cartItems, notes, promoCode }) {
  if (isSupabaseConfigured && supabase) {
    const rpcPayload = {
      p_customer_name: customer.fullName.trim(),
      p_phone: customer.phone.trim(),
      p_address: customer.address.trim(),
      p_area: customer.area.trim(),
      p_city: customer.city ? customer.city.trim() : "Gujranwala",
      p_notes: notes ? notes.trim() : "",
      p_cart_items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      p_promo_code: promoCode ? promoCode.trim() : null,
    };

    const { data, error } = await supabase.rpc("place_order", rpcPayload);

    if (error) {
      throw new Error(error.message || "Failed to place order in database");
    }

    if (!data || !data.success) {
      throw new Error("Order creation failed on server");
    }

    return {
      orderId: data.order_number,
      customer: {
        fullName: data.customer_name,
        phone: data.phone,
        address: data.address,
        area: data.area,
        city: data.city,
        instructions: notes,
        paymentMethod: "cod",
      },
      items: data.items.map((i) => ({
        product: { id: i.product_id, name: i.name, price: i.unit_price },
        quantity: i.quantity,
      })),
      subtotal: data.subtotal,
      deliveryFee: data.delivery_fee,
      discount: data.discount,
      total: data.total,
      status: data.status,
      createdAt: new Date().toISOString(),
    };
  }

  // In production builds, strictly block fallback: no local order storage, no fake order numbers
  if (!import.meta.env.DEV) {
    throw new Error(
      "Online ordering is currently unavailable. Live database connection is required."
    );
  }

  // Local Secure Fallback ONLY in Development Mode (import.meta.env.DEV)
  let calculatedSubtotal = 0;
  const verifiedItems = cartItems.map((cartItem) => {
    const catalogItem = fallbackProducts.find((p) => p.id === cartItem.product.id);
    const unitPrice = catalogItem ? catalogItem.price : cartItem.product.price;
    calculatedSubtotal += unitPrice * cartItem.quantity;
    return {
      product: {
        id: cartItem.product.id,
        name: catalogItem ? catalogItem.name : cartItem.product.name,
        price: unitPrice,
        image: catalogItem ? catalogItem.image : cartItem.product.image,
      },
      quantity: cartItem.quantity,
    };
  });

  const deliveryFee = calculatedSubtotal >= 1500 ? 0 : 150;
  const grandTotal = calculatedSubtotal + deliveryFee;
  const orderNumber = `BH-DEV-${Math.floor(100000 + Math.random() * 900000)}`;

  const localOrder = {
    orderId: orderNumber,
    customer,
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    deliveryFee,
    discount: 0,
    total: grandTotal,
    status: "new",
    createdAt: new Date().toISOString(),
    isDevDemo: true,
  };

  try {
    localStorage.setItem("latest_order", JSON.stringify(localOrder));
  } catch (e) {
    console.error("Local order caching error", e);
  }

  return localOrder;
}

/**
 * Fetch single order by order number (safe public lookup using get_order_by_number RPC)
 * Returns { data, error }
 */
export async function getOrderByNumber(orderNumber) {
  if (!orderNumber || typeof orderNumber !== "string") {
    return { data: null, error: null };
  }

  const cleanOrderNumber = orderNumber.trim();
  if (!cleanOrderNumber) {
    return { data: null, error: null };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // Calls security-definer get_order_by_number(order_number)
      const { data, error } = await supabase.rpc("get_order_by_number", {
        order_number: cleanOrderNumber,
      });

      if (error) {
        return { data: null, error: error.message || "Failed to retrieve order from server" };
      }

      if (!data) {
        return { data: null, error: null };
      }

      const fullName = (data.customer_name || "").trim();
      const firstName = data.first_name || (fullName ? fullName.split(" ")[0] : "");

      return {
        data: {
          orderId: data.order_number,
          customer: {
            fullName: fullName || "Valued Customer",
            firstName: firstName || fullName || "Valued Customer",
            phone: data.phone || null,
            address: data.address || null,
            area: data.area || null,
            city: data.city || null,
            paymentMethod: "cod",
          },
          items: (data.items || []).map((i) => ({
            product: { id: i.product_id, name: i.name, price: Number(i.unit_price) },
            quantity: Number(i.quantity),
          })),
          subtotal: Number(data.subtotal || 0),
          deliveryFee: Number(data.delivery_fee || 0),
          discount: Number(data.discount || 0),
          total: Number(data.total || 0),
          status: data.status || "new",
          createdAt: data.created_at || new Date().toISOString(),
        },
        error: null,
      };
    } catch (e) {
      return { data: null, error: e.message || "Network error loading order" };
    }
  }

  // Fallback to local storage ONLY in development mode (import.meta.env.DEV)
  if (import.meta.env.DEV) {
    try {
      const saved = localStorage.getItem("latest_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.orderId === cleanOrderNumber) {
          const fullName = (parsed.customer?.fullName || "").trim();
          const firstName = fullName ? fullName.split(" ")[0] : "";
          return {
            data: {
              ...parsed,
              customer: {
                ...parsed.customer,
                firstName: firstName || "Valued Customer",
              },
            },
            error: null,
          };
        }
      }
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  }

  return { data: null, error: "Database connection unavailable" };
}
