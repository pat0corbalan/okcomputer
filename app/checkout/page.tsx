"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Landmark, Wallet, MessageCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SiteHeader } from "@/components/site-header"
import { useCart } from "@/lib/cart-context"
import { formatPrice, storeConfig } from "@/lib/store-config"
import { buildWhatsappUrl, type CustomerInfo, type PaymentMethod } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clear } = useCart()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [payment, setPayment] = useState<PaymentMethod>("transferencia")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Ingresá tu nombre."
    if (!phone.trim()) e.phone = "Ingresá tu teléfono."
    if (!address.trim()) e.address = "Ingresá la dirección de entrega."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault()
    if (items.length === 0) return
    if (!validate()) return

    const customer: CustomerInfo = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      payment,
    }

    const url = buildWhatsappUrl(customer, items)

    // Guardamos un resumen para la pantalla de confirmación.
    try {
      sessionStorage.setItem(
        "okcomputer-last-order",
        JSON.stringify({ name: customer.name, total: totalPrice }),
      )
    } catch {
      // ignore
    }

    clear()
    window.open(url, "_blank", "noopener,noreferrer")
    router.push("/pedido-enviado")
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold">Tu carrito está vacío</h1>
          <p className="text-muted-foreground">
            Agregá productos antes de finalizar la compra.
          </p>
          <Button asChild>
            <Link href="/">Ver productos</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Seguir comprando
        </Link>

        <h1 className="mb-6 font-display text-3xl font-bold">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-8">
            {/* Datos del cliente */}
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display text-lg font-bold">Tus datos</h2>
              <div className="grid gap-4">
                <Field
                  id="name"
                  label="Nombre completo"
                  value={name}
                  onChange={setName}
                  error={errors.name}
                  placeholder="Ej: Juan Pérez"
                />
                <Field
                  id="phone"
                  label="Teléfono"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  error={errors.phone}
                  placeholder="Ej: 385 123 4567"
                />
                <Field
                  id="address"
                  label="Dirección de entrega"
                  value={address}
                  onChange={setAddress}
                  error={errors.address}
                  placeholder="Calle, número, barrio, referencia"
                />
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Aclaraciones para la entrega"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                <Truck className="h-4 w-4 shrink-0" />
                <span>
                  Envíos únicamente dentro de {storeConfig.deliveryZone}. Coordinamos
                  la entrega por WhatsApp.
                </span>
              </div>
            </section>

            {/* Método de pago */}
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display text-lg font-bold">Método de pago</h2>
              <RadioGroup
                value={payment}
                onValueChange={(v) => setPayment(v as PaymentMethod)}
                className="grid gap-3 sm:grid-cols-2"
              >
                <PaymentOption
                  value="transferencia"
                  selected={payment === "transferencia"}
                  icon={<Landmark className="h-5 w-5" />}
                  title="Transferencia bancaria"
                  desc="Te enviamos los datos por WhatsApp."
                />
                <PaymentOption
                  value="efectivo"
                  selected={payment === "efectivo"}
                  icon={<Wallet className="h-5 w-5" />}
                  title="Efectivo"
                  desc="Abonás al recibir el pedido."
                />
              </RadioGroup>
            </section>
          </div>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display text-lg font-bold">Tu pedido</h2>
              <ul className="flex flex-col gap-3">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                        {quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {quantity} x {formatPrice(product.price)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <Button type="submit" size="lg" className="mt-5 w-full">
                <MessageCircle className="h-5 w-5" />
                Confirmar pedido por WhatsApp
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Al confirmar se abrirá WhatsApp con el detalle de tu pedido listo
                para enviar.
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  type?: string
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={cn(error && "border-destructive")}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function PaymentOption({
  value,
  selected,
  icon,
  title,
  desc,
}: {
  value: string
  selected: boolean
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Label
      htmlFor={`pay-${value}`}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
        selected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50",
      )}
    >
      <RadioGroupItem id={`pay-${value}`} value={value} className="mt-0.5" />
      <span className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-medium">
          {icon}
          {title}
        </span>
        <span className="text-sm text-muted-foreground">{desc}</span>
      </span>
    </Label>
  )
}
