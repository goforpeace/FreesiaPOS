
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect } from "react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";


const variantSchema = z.object({
  color: z.string().min(1, "Color is required."),
  imageUrls: z.array(z.object({ value: z.string().url("Please enter a valid URL.") })).min(1, "At least one image URL is required per variant."),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
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
  isBags: z.boolean().default(false),
  isJewelry: z.boolean().default(false),
  tag: z.enum(productTags).optional().nullable(),
  createdAt: z.date().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema> & {
    variants: Array<{ color: string; imageUrls: string[]; quantity: number; }>;
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
            : [{ color: "", imageUrls: [{ value: "" }], quantity: 0 }],
        quantity: initialData?.quantity || 0,
        costPrice: initialData?.costPrice || 0,
        sellPrice: initialData?.sellPrice || 0,
        discountedPrice: initialData?.discountedPrice || undefined,
        isNewArrival: initialData?.isNewArrival || false,
        isFlashSale: initialData?.isFlashSale || false,
        isBags: initialData?.isBags || false,
        isJewelry: initialData?.isJewelry || false,
        tag: initialData?.tag || undefined,
        createdAt: initialData?.createdAt ? new Date(initialData.createdAt) : undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const watchedVariants = useWatch({
    control: form.control,
    name: 'variants',
  });

  useEffect(() => {
    const totalQuantity = watchedVariants.reduce((sum, variant) => sum + (Number(variant.quantity) || 0), 0);
    form.setValue('quantity', totalQuantity, { shouldValidate: true });
  }, [watchedVariants, form]);


  const onSubmit = (values: z.infer<typeof productFormSchema>) => {
    const transformedValues = {
        ...values,
        variants: values.variants.map(variant => ({
            ...variant,
            imageUrls: variant.imageUrls.map(urlObj => urlObj.value),
        })),
        imageUrls: values.variants.flatMap(v => v.imageUrls.map(url => url.value)),
        discountedPrice: values.discountedPrice || 0,
        createdAt: values.createdAt ? values.createdAt.toISOString() : new Date().toISOString(),
    };
    onSubmitProp(transformedValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{initialData ? 'Save Changes' : 'Create Product'}</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                      <FormLabel>Total Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25" {...field} readOnly className="bg-muted"/>
                      </FormControl>
                       <FormDescription>Calculated from variants.</FormDescription>
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
                  name="isBags"
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
                          Bags
                        </FormLabel>
                        <FormDescription>
                           This product will appear on the "Bags" category page.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="isJewelry"
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
                          Jewelry
                        </FormLabel>
                        <FormDescription>
                          This product will appear on the "Jewelry" category page.
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
                       <Select onValueChange={(value) => field.onChange(value === "none" ? null : value)} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tag to display on the product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
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
          <div className="space-y-8 sticky top-4">
             <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                 <CardDescription>
                  Add one or more product variants. Each variant needs a color, quantity and at least one image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <ScrollArea className="h-[400px] w-full">
                    <div className="space-y-6 pr-6">
                        {fields.map((variantField, index) => (
                            <VariantField key={variantField.id} form={form} variantIndex={index} removeVariant={() => remove(index)} />
                        ))}
                    </div>
                 </ScrollArea>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-6"
                    onClick={() => append({ color: "", imageUrls: [{value: ""}], quantity: 0 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add another variant
                 </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Advanced</CardTitle>
              </CardHeader>
              <CardContent>
                 <FormField
                    control={form.control}
                    name="createdAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Creation Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Leave blank to use the current date. Set a past date for old products.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
              </CardContent>
            </Card>
          </div>
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
             <div className="grid grid-cols-2 gap-4">
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
                 <FormField
                    control={form.control}
                    name={`variants.${variantIndex}.quantity`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <div className="space-y-2">
                <FormLabel>Variant Images</FormLabel>
                {fields.map((imageField, imageIndex) => {
                    const imageUrl = form.watch(`variants.${variantIndex}.imageUrls.${imageIndex}.value`);
                    return (
                        <FormField
                            key={imageField.id}
                            control={form.control}
                            name={`variants.${variantIndex}.imageUrls.${imageIndex}.value`}
                            render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="preview" width={40} height={40} className="rounded-md object-cover"/>
                                ) : (
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                    </div>
                                )}
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
                    )
                })}
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
