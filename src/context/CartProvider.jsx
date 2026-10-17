import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

const CART_STORAGE_KEY = "crunch_box_cart";
const FREE_DELIVERY_THRESHOLD = 1500;
const STANDARD_DELIVERY_FEE = 150;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Could not save cart to localStorage", e);
    }
  }, [cart]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 2800);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    showNotification(`Added ${product.name} to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const setItemQuantity = (productId, exactQuantity) => {
    if (exactQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: exactQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee =
    cartSubtotal === 0 || cartSubtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : STANDARD_DELIVERY_FEE;
  const grandTotal = cartSubtotal + deliveryFee;
  const amountNeededForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - cartSubtotal
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setItemQuantity,
        clearCart,
        totalItems,
        cartSubtotal,
        deliveryFee,
        grandTotal,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        amountNeededForFreeDelivery,
        notification,
      }}
    >
      {children}
      {/* Toast Notification with aria-live */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-neutral-700 animate-bounce duration-300"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}
