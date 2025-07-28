
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrls: z.array(z.object({ value: z.string().url("Please enter a valid URL.") })).min(1, "At least one image URL is required."),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative."),
  sellPrice: z.coerce.number().min(0, "Sell price cannot be negative."),
  isNewArrival: z.boolean().default(false),
  isOfferSale: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product;
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductForm({ initialData, isSubmitting, onSubmit: onSubmitProp }: ProductFormProps) {
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData 
      ? { 
          ...initialData, 
          imageUrls: initialData.imageUrls?.length ? initialData.imageUrls.map(url => ({ value: url })) : [{ value: '' }],
          isNewArrival: initialData.isNewArrival || false,
          isOfferSale: initialData.isOfferSale || false,
        }
      : {
          name: "",
          description: "",
          imageUrls: [{ value: "" }],
          quantity: 0,
          costPrice: 0,
          sellPrice: 0,
          isNewArrival: false,
          isOfferSale: false,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "imageUrls"
  });

  const onSubmit = (values: ProductFormValues) => {
    // The parent component expects `imageUrls` to be an array of strings,
    // but react-hook-form's useFieldArray works with an array of objects.
    // So we transform the data before submitting.
    const transformedValues = {
        ...values,
        imageUrls: values.imageUrls.map(url => url.value)
    };
    // @ts-ignore
    onSubmitProp(transformedValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Elegant Violet Vase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about the product"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price (BDT)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Price (BDT)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Select categories to display this product in specific sections of the website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="isNewArrival"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          New Arrival
                        </FormLabel>
                        <FormDescription>
                          Display this product in the "New Arrivals" section on the homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="isOfferSale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Offer Sale
                        </FormLabel>
                        <FormDescription>
                           Display this product in a special "Offer Sale" section on the homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
             <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                 <CardDescription>
                  Add one or more image URLs for your product. The first image will be the main display image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`imageUrls.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={cn(index !== 0 && "sr-only")}>Image URL</FormLabel>
                        <div className="flex items-center gap-2">
                           <FormControl>
                              <Input placeholder="https://example.com/image.png" {...field} />
                           </FormControl>
                           {fields.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                           )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ value: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add another image
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{initialData ? 'Save Changes' : 'Create Product'}</Button>
        </div>
      </form>
    </Form>
  );
}
