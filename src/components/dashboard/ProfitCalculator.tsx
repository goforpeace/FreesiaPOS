
"use client"

import { useState, useMemo } from "react"
import Image from "next/image"

import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfitCalculatorProps {
  products: Product[];
}

export function ProfitCalculator({ products }: ProfitCalculatorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [sellPrice, setSellPrice] = useState<number>(0)

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null
  }, [selectedProductId, products])

  const profit = useMemo(() => {
    if (!selectedProduct) return 0
    return sellPrice - selectedProduct.costPrice
  }, [selectedProduct, sellPrice])

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProductId(productId)
      setSellPrice(product.sellPrice)
    }
  }
  
  const handleSellPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellPrice(value === '' ? 0 : parseFloat(value));
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Product</Label>
          <Select onValueChange={handleProductChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product..." />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.imageUrls?.[0] || 'https://placehold.co/40x40.png'}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                      data-ai-hint="product image"
                    />
                    <div>
                      <p>{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantity} in stock</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input value={formatCurrency(selectedProduct.costPrice)} readOnly className="font-medium border-0"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell-price">Sell Price</Label>
                <Input
                  id="sell-price"
                  type="number"
                  value={sellPrice}
                  onChange={handleSellPriceChange}
                  className="font-medium"
                />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <Label>Calculated Profit</Label>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatCurrency(profit)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
