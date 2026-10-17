import { BUSINESS_CONFIG } from "../config/business";

/**
 * Trims duplicate trailing area from the street address if present,
 * e.g. "House 28, Street 7, Model Town" with area "Model Town" -> "House 28, Street 7"
 */
export function cleanAddressAndArea(address = "", area = "") {
  const rawAddress = (address || "").trim();
  const rawArea = (area || "").trim();

  let cleanStreet = rawAddress;
  if (rawArea && cleanStreet.toLowerCase().endsWith(rawArea.toLowerCase())) {
    cleanStreet = cleanStreet.slice(0, -rawArea.length).replace(/,\s*$/, "").trim();
  }

  return {
    streetAddress: cleanStreet,
    area: rawArea,
  };
}

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

  const { streetAddress, area: cleanArea } = cleanAddressAndArea(address, area);

  const addressDetails = (() => {
    if (streetAddress && cleanArea) {
      return `*Address:* ${streetAddress}\n*Area:* ${cleanArea}, ${city}`;
    }
    if (streetAddress) {
      return `*Address:* ${streetAddress}, ${city}`;
    }
    if (cleanArea) {
      return `*Area:* ${cleanArea}, ${city}`;
    }
    return `*Delivery City:* ${city}`;
  })();

  const message =
    `*ORDER CONFIRMATION - ${orderNumber}*\n\n` +
    `*Customer:* ${customerName}\n` +
    `*Contact:* ${phone}\n` +
    `${addressDetails}\n` +
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

/**
 * Builds a short WhatsApp inquiry link for refreshed or direct links (no router state).
 * Format: "Hi Baba Hafeez, my order number is BH-XXXX" + items + total
 */
export function buildWhatsAppShortLink({
  orderNumber,
  items = [],
  total = 0,
}) {
  const itemsText = items.length > 0
    ? items
        .map(
          (item) =>
            `• ${item.quantity}x ${item.product?.name || item.name || "Item"}`
        )
        .join("\n")
    : "";

  let message = `Hi ${BUSINESS_CONFIG.name}, my order number is ${orderNumber}.`;
  if (itemsText) {
    message += `\n\n*Items:*\n${itemsText}`;
  }
  if (total) {
    message += `\n\n*Total:* Rs. ${Number(total).toLocaleString()}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodedMessage}`;
}

