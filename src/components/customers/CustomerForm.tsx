
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { Customer } from "@/lib/types";

const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(11, "Phone number must be valid.").max(15),
  address: z.string().optional(),
  status: z.enum(["follow-up", "fraud", "none"]).optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (values: CustomerFormValues) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onClose,
  isSubmitting,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      status: initialData?.status || "none",
      notes: initialData?.notes || "",
    },
  });

  const handleSubmit = (values: CustomerFormValues) => {
    const submissionData = {
      ...values,
      status: values.status === "none" ? null : values.status,
    };
    onSubmit(submissionData as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="01xxxxxxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Full shipping address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="follow-up">Follow Up</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any special notes about this customer?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Customer")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
