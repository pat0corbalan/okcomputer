"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react"
import type { Product } from "@/lib/products"

export type CartItem = {
  product: Product
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD"; product: Product; quantity?: number }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] }

const STORAGE_KEY = "okcomputer-cart"

// Helper idéntico para asegurar que el Reducer y los Componentes lean exactamente el mismo string identificador
const getProductId = (product: any): string => {
  if (!product) return ""
  
  // Si _id viene como objeto de Mongo { $oid: "..." }
  const mongoId = product._id && typeof product._id === 'object' && '$oid' in product._id 
    ? (product._id as any).$oid 
    : product._id;

  const id = product.id || mongoId || product.sku || product.codigo_original
  return String(id)
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items }
    case "ADD": {
      const qty = action.quantity ?? 1
      const targetAddId = getProductId(action.product)
      
      const existing = state.items.find((i) => getProductId(i.product) === targetAddId)
      
      if (existing) {
        return {
          items: state.items.map((i) =>
            getProductId(i.product) === targetAddId
              ? { ...i, quantity: i.quantity + qty }
              : i,
          ),
        }
      }
      return { items: [...state.items, { product: action.product, quantity: qty }] }
    }
    case "REMOVE":
      return { items: state.items.filter((i) => getProductId(i.product) !== action.id) }
      
    case "SET_QTY": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => getProductId(i.product) !== action.id) }
      }
      return {
        items: state.items.map((i) =>
          getProductId(i.product) === action.id ? { ...i, quantity: action.quantity } : i,
        ),
      }
    }
    case "CLEAR":
      return { items: [] }
    default:
      return state
  }
}

type CartContextValue = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  const [isOpen, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const items = JSON.parse(raw) as CartItem[]
        dispatch({ type: "HYDRATE", items })
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage.
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // ignore quota errors
    }
  }, [state.items, hydrated])

  const value = useMemo<CartContextValue>(() => {
    const totalItems = state.items.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = state.items.reduce(
      (acc, i) => acc + i.product.price * i.quantity,
      0,
    )
    return {
      items: state.items,
      addItem: (product, quantity) => dispatch({ type: "ADD", product, quantity }),
      removeItem: (id) => dispatch({ type: "REMOVE", id }),
      setQuantity: (id, quantity) => dispatch({ type: "SET_QTY", id, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
      totalItems,
      totalPrice,
      isOpen,
      setOpen,
    }
  }, [state.items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}