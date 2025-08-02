

"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Coupon } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";


const couponFormSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters.").max(20).transform(v => v.toUpperCase()),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number().min(1, "Discount value must be at least 1."),
    usageLimit: z.coerce.number().int().min(1, "Usage limit must be at least 1."),
    isActive: z.boolean().default(true),
}).refine(data => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: "Percentage discount cannot exceed 100%",
    path: ["discountValue"],
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

const CouponForm = ({
    initialData,
    onSubmit,
    onClose,
}: {
    initialData?: Coupon;
    onSubmit: (values: CouponFormValues) => void;
    onClose: () => void;
}) => {
    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponFormSchema),
        defaultValues: initialData || {
            code: "",
            discountType: 'percentage',
            discountValue: 10,
            usageLimit: 1,
            isActive: true,
        },
    });
    
    const discountType = form.watch("discountType");

    const handleSubmit = (values: CouponFormValues) => {
        onSubmit(values);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Coupon Code</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. SUMMER24" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Discount Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="percentage" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Percentage (%)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="fixed" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Fixed Amount (BDT)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder={discountType === 'percentage' ? "10" : "500"} {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="usageLimit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Usage Limit</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="100" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Is Active?</FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">
                        {initialData ? "Save Changes" : "Create Coupon"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
  const { toast } = useToast();

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedCoupons = await getCoupons();
      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      toast({ title: "Error", description: "Failed to load coupons.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleFormSubmit = async (values: CouponFormValues) => {
    try {
        if (editingCoupon) {
            await updateCoupon(editingCoupon.id, values);
            toast({ title: "Coupon Updated", description: "The coupon has been successfully updated." });
        } else {
            await createCoupon(values);
            toast({ title: "Coupon Created", description: "The new coupon has been successfully created." });
        }
        await fetchCoupons();
        setIsFormOpen(false);
        setEditingCoupon(undefined);
    } catch (error) {
         console.error("Failed to save coupon:", error);
         toast({ title: "Error", description: "Failed to save the coupon.", variant: "destructive" });
    }
  };
  
  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteCoupon(id);
        toast({ title: "Coupon Deleted", description: "The coupon has been successfully deleted." });
        await fetchCoupons();
    } catch (error) {
        console.error("Failed to delete coupon:", error);
        toast({ title: "Error", description: "Failed to delete the coupon.", variant: "destructive" });
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
        setEditingCoupon(undefined);
    }
  }


  return (
    <>
      <Header title="Manage Coupons">
        <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Coupon
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
                </DialogHeader>
                <CouponForm 
                    initialData={editingCoupon}
                    onSubmit={handleFormSubmit}
                    onClose={() => handleOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
      </Header>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={6} className="p-4">
                             <div className="h-8 bg-muted animate-pulse rounded-lg" />
                        </TableCell>
                    </TableRow>
                ))
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>
                        {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}%` 
                            : formatCurrency(coupon.discountValue)
                        }
                    </TableCell>
                    <TableCell>{coupon.timesUsed} / {coupon.usageLimit}</TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "secondary" : "outline"}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(coupon.createdAt), "dd MMM, yyyy")}</TableCell>
                    <TableCell>
                      <AlertDialog>
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(coupon)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this coupon.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(coupon.id)}>
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
