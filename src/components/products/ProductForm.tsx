

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { type Product, type ProductVariant, productTags, ProductTag } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const variantSchema = z.object({
  color: z.string().min(1, "Color is required."),
  imageUrls: z.array(z.object({ value: z.string().url("Please enter a valid URL.") })).min(1, "At least one image URL is required per variant."),
});

const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative."),
  sellPrice: z.coerce.number().min(0, "Sell price cannot be negative."),
  discountedPrice: z.coerce.number().min(0).optional().nullable(),
  isNewArrival: z.boolean().default(false),
  isFlashSale: z.boolean().default(false),
  tag: z.enum(productTags).optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productFormSchema> & {
    variants: Array<{ color: string; imageUrls: string[] }>;
};

interface ProductFormProps {
  initialData?: Product;
  isSubmitting: boolean;
  onSubmit: (values: any) => void;
}

export function ProductForm({ initialData, isSubmitting, onSubmit: onSubmitProp }: ProductFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
        name: initialData?.name || "",
        description: initialData?.description || "",
        variants: initialData?.variants?.length 
            ? initialData.variants.map(v => ({...v, imageUrls: v.imageUrls.map(url => ({value: url}))}))
            : [{ color: "", imageUrls: [{ value: "" }] }],
        quantity: initialData?.quantity || 0,
        costPrice: initialData?.costPrice || 0,
        sellPrice: initialData?.sellPrice || 0,
        discountedPrice: initialData?.discountedPrice || undefined,
        isNewArrival: initialData?.isNewArrival || false,
        isFlashSale: initialData?.isFlashSale || false,
        tag: initialData?.tag || undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const onSubmit = (values: z.infer<typeof productFormSchema>) => {
    const transformedValues = {
        ...values,
        variants: values.variants.map(variant => ({
            ...variant,
            imageUrls: variant.imageUrls.map(urlObj => urlObj.value),
        })),
        // This combines all variant images into the top-level `imageUrls` for backward compatibility
        // and for components that might only use the primary image.
        imageUrls: values.variants.flatMap(v => v.imageUrls.map(url => url.value)),
        discountedPrice: values.discountedPrice || 0,
    };
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
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  name="discountedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discounted Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="4900" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
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
                <CardTitle>Categories & Tags</CardTitle>
                <CardDescription>Select categories and a tag to display this product in specific sections of the website.</CardDescription>
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
                          New Arrivals
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
                  name="isFlashSale"
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
                          Flash Sale
                        </FormLabel>
                        <FormDescription>
                           Display this product in a special "Flash Sale" section on the homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Tag</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tag to display on the product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {productTags.map(tag => (
                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This tag will be displayed on the product card.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
             <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                 <CardDescription>
                  Add one or more product variants. Each variant needs a color and at least one image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((variantField, index) => (
                    <VariantField key={variantField.id} form={form} variantIndex={index} removeVariant={() => remove(index)} />
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => append({ color: "", imageUrls: [{value: ""}] })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add another variant
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


function VariantField({ form, variantIndex, removeVariant }: { form: any, variantIndex: number, removeVariant: () => void }) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `variants.${variantIndex}.imageUrls`
    });

    return (
        <div className="p-4 border rounded-md space-y-4 relative">
             <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={removeVariant}
                >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Remove Variant</span>
            </Button>
            <FormField
                control={form.control}
                name={`variants.${variantIndex}.color`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Variant Color</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. Cherry Red" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            <div className="space-y-2">
                <FormLabel>Variant Images</FormLabel>
                {fields.map((imageField, imageIndex) => (
                    <FormField
                        key={imageField.id}
                        control={form.control}
                        name={`variants.${variantIndex}.imageUrls.${imageIndex}.value`}
                        render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                            <FormControl>
                                <Input placeholder="https://example.com/image.png" {...field} />
                            </FormControl>
                            {fields.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(imageIndex)}>
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
                    Add Image URL
                </Button>
            </div>
        </div>
    )
}

    
