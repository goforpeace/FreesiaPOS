

"use client";

import { MoreHorizontal, Pencil, Trash2, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { type Product } from "@/lib/types";
import { deleteProduct, rejectProduct } from "@/lib/api";

export function ProductActions({ product, onProductUpdate }: { product: Product, onProductUpdate: () => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `Product "${product.name}" has been deleted.`,
      });
      onProductUpdate();
    } catch (error: any) {
       toast({
        title: "Error deleting product",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    try {
      await rejectProduct(product.id);
      toast({
        title: "Product Rejected",
        description: `Product "${product.name}" has been marked as rejected.`,
      });
       onProductUpdate();
    } catch (error) {
      toast({
        title: "Error rejecting product",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/products/view/${product.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleReject} disabled={product.isRejected}>
            <XCircle className="mr-2 h-4 w-4" />
            <span>Reject Item</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
