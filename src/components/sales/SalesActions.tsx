
"use client";

import { MoreHorizontal, Eye, Trash2, Pencil, CheckCircle, XCircle, RotateCcw } from "lucide-react";
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
import { deleteSale, updateSaleStatus } from "@/lib/api";
import type { Sale } from "@/lib/types";

export function SalesActions({ sale, onSaleUpdate }: { sale: Sale, onSaleUpdate: () => void }) {
  const { toast } = useToast();

  const handleStatusChange = async (status: 'pending' | 'accepted' | 'cancelled') => {
    try {
      await updateSaleStatus(sale.id, status);
       toast({
        title: "Sale Status Updated",
        description: `Invoice #${sale.id} has been marked as ${status}.`,
      });
      onSaleUpdate();
    } catch (error) {
       toast({
        title: `Error updating status to ${status}`,
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSale(sale.id);
      toast({
        title: "Sale Deleted",
        description: `Invoice #${sale.id} has been deleted.`,
      });
      onSaleUpdate();
    } catch (error) {
      toast({
        title: "Error deleting sale",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const status = sale.status || 'pending';

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
           {status === 'pending' && (
             <DropdownMenuItem onSelect={() => handleStatusChange('accepted')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Mark as Accepted</span>
            </DropdownMenuItem>
          )}
           {status === 'accepted' && (
             <DropdownMenuItem onSelect={() => handleStatusChange('pending')}>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Mark as Pending</span>
            </DropdownMenuItem>
          )}
          {status !== 'cancelled' && (
             <DropdownMenuItem onSelect={() => handleStatusChange('cancelled')}>
              <XCircle className="mr-2 h-4 w-4" />
              <span>Mark as Cancelled</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/sales/${sale.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View Invoice</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href={`/sales/${sale.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </Link>
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
            This action cannot be undone. This will permanently delete the sale
            and restore the stock for the products sold.
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
