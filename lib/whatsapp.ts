import type { CartItem } from "@/lib/cart-context"
import { formatPrice, storeConfig } from "@/lib/store-config"

export type PaymentMethod = "transferencia" | "efectivo"

export type CustomerInfo = {
  name: string
  phone: string
  address: string
  notes?: string
  payment: PaymentMethod
}

const paymentLabels: Record<PaymentMethod, string> = {
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo",
}

export function paymentLabel(method: PaymentMethod): string {
  return paymentLabels[method]
}

export function buildOrderMessage(customer: CustomerInfo, items: CartItem[]): string {
  const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)

  const lines: string[] = []
  lines.push(`*Nuevo pedido — ${storeConfig.name}*`)
  lines.push("")
  lines.push("*Datos del cliente*")
  lines.push(`Nombre: ${customer.name}`)
  lines.push(`Teléfono: ${customer.phone}`)
  lines.push(`Dirección de entrega: ${customer.address}`)
  lines.push(`Zona: ${storeConfig.deliveryZone}`)
  lines.push(`Método de pago: ${paymentLabels[customer.payment]}`)
  if (customer.notes && customer.notes.trim()) {
    lines.push(`Notas: ${customer.notes.trim()}`)
  }
  lines.push("")
  lines.push("*Detalle del pedido*")

  items.forEach((item) => {
    const subtotal = item.product.price * item.quantity
    lines.push(`• ${item.product.name}`)
    lines.push(
      `   ${item.quantity} x ${formatPrice(item.product.price)} = ${formatPrice(subtotal)}`,
    )
  })

  lines.push("")
  lines.push(`*TOTAL: ${formatPrice(total)}*`)
  lines.push("")
  lines.push("Quedo a la espera para coordinar la entrega. ¡Gracias!")

  return lines.join("\n")
}

export function buildWhatsappUrl(customer: CustomerInfo, items: CartItem[]): string {
  const text = encodeURIComponent(buildOrderMessage(customer, items))
  return `https://wa.me/${storeConfig.whatsappNumber}?text=${text}`
}
