// =============================================================
//  CONFIGURACION DE LA TIENDA — OKComputer
//  Edita estos valores para personalizar la tienda.
// =============================================================

export const storeConfig = {
  name: "OKComputer",
  tagline: "Tecnología para tu día a día",
  description:
    "Accesorios para celulares, informática, electrónica, repuestos, herramientas y hogar. Envíos dentro de Santiago del Estero Capital.",

  // Numero de WhatsApp de la tienda al que llegan los pedidos.
  // Formato internacional SIN el signo +, ni espacios ni guiones.
  // Ejemplo Argentina (Santiago del Estero): 54 9 385 XXXXXXX  ->  "5493854XXXXXX"
  // >>> REEMPLAZA ESTE NUMERO POR EL DE TU TIENDA <<<
  whatsappNumber: "543856128340",

  // Zona de entrega mostrada al cliente.
  deliveryZone: "Santiago del Estero Capital",

  // Moneda para formatear precios.
  currency: "ARS",
  locale: "es-AR",
} as const

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(storeConfig.locale, {
    style: "currency",
    currency: storeConfig.currency,
    maximumFractionDigits: 0,
  }).format(value)
}
