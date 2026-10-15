import { BUSINESS_CONFIG } from "../config/business";

/**
 * Builds a properly URL-encoded WhatsApp direct link for order transmission.
 * Handles special characters like &, #, %, Urdu text, and emojis safely.
 */
export function buildWhatsAppOrderLink({
  orderNumber,
  customerName,
  phone,
  address,
  area,
  city = "Gujranwala",
  items,
  total,
  deliveryFee,
  instructions,
}) {
  const itemsText = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} (Rs. ${(
          item.product.price * item.quantity
        ).toLocaleString()})`
    )
    .join("\n");

  const message =
    `*ORDER CONFIRMATION - ${orderNumber}*\n\n` +
    `*Customer:* ${customerName}\n` +
    `*Contact:* ${phone}\n` +
    `*Delivery Address:* ${address}, ${area}, ${city}\n` +
    `*Special Notes:* ${instructions ? instructions : "None"}\n\n` +
    `*Items Ordered:*\n${itemsText}\n\n` +
    `*Delivery Fee:* ${
      deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`
    }\n` +
    `*Total Bill:* Rs. ${total.toLocaleString()} (Cash on Delivery)\n\n` +
    `_Thank you for ordering with ${BUSINESS_CONFIG.name}!_`;

  // Use standard encodeURIComponent to handle Urdu, spaces, # and &
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodedMessage}`;
}
