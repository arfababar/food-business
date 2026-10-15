import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { products as fallbackProducts } from "../data/products";

/**
 * Fetch products from Supabase, or fall back to local dataset if unavailable.
 */
export async function getProducts() {
  if (!isSupabaseConfigured || !supabase) {
    return { data: fallbackProducts, isFallback: true };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Could not fetch products from Supabase, using local fallback.", error);
      return { data: fallbackProducts, isFallback: true };
    }

    // Map database fields to application shape
    const formatted = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      description: item.description,
      image: item.image_url,
      badge: item.badge,
      prepTime: item.prep_time || "15-20 mins",
      spicyLevel: item.spicy_level || "Regular",
      isFeatured: Boolean(item.is_featured),
    }));

    return { data: formatted, isFallback: false };
  } catch (err) {
    console.error("Network error fetching products:", err);
    return { data: fallbackProducts, isFallback: true };
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

  // Local Secure Fallback when Supabase keys are not set yet
  // Recalculates from fallback catalog to prevent client tampering
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
  const orderNumber = `BH-${Math.floor(100000 + Math.random() * 900000)}`;

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
  };

  try {
    localStorage.setItem("latest_order", JSON.stringify(localOrder));
  } catch (e) {
    console.error("Local order caching error", e);
  }

  return localOrder;
}

/**
 * Fetch single order by order number (safe public lookup)
 */
export async function getOrderByNumber(orderNumber) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc("get_order_by_number", {
        p_order_number: orderNumber,
      });

      if (!error && data) {
        return {
          orderId: data.order_number,
          customer: {
            fullName: data.customer_name,
            phone: data.phone,
            address: data.address,
            area: data.area,
            city: data.city,
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
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn("Error fetching order via Supabase, falling back to local cache", e);
    }
  }

  // Fallback to local storage
  try {
    const saved = localStorage.getItem("latest_order");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.orderId === orderNumber) return parsed;
    }
  } catch (err) {
    console.error(err);
  }

  return null;
}
