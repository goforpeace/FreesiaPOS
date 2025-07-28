
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';


const navLinks = [
    { name: 'New Arrival', href: '#' },
    { name: 'All Products', href: '#all-products' },
    { name: 'Offer Sale', href: '#' },
];

export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const { totalItems } = useCart();
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const cartCount = totalItems();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }
        router.push(`/?${params.toString()}#all-products`);
        setIsSearchOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-20 max-w-screen-2xl items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3">
                     <Image 
                        src="https://i.imgur.com/k7qYBOW.png" 
                        alt="Freesia Finds Logo" 
                        width={60} 
                        height={60} 
                        className="rounded-md"
                        data-ai-hint="logo"
                    />
                    <span className="font-bold font-headline text-2xl text-primary hidden sm:inline-block">Freesia Finds</span>
                </Link>

                <nav className={cn("hidden md:flex items-center gap-8 text-lg font-medium", isSearchOpen && "hidden")}>
                    {navLinks.map(link => (
                        <Link key={link.name} href={link.href} className="text-foreground/70 transition-colors hover:text-foreground">{link.name}</Link>
                    ))}
                </nav>
                
                 <div className={cn("hidden md:flex flex-grow justify-center", !isSearchOpen && "hidden")}>
                    <form onSubmit={handleSearch} className="relative w-full max-w-md">
                        <Input 
                            type="search" 
                            placeholder="Search for products..."
                            className="w-full pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                         <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                            <Search className="h-5 w-5" />
                        </Button>
                    </form>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                        {isSearchOpen ? <X className="h-5 w-5"/> : <Search className="h-5 w-5" />}
                        <span className="sr-only">Search</span>
                    </Button>
                     <Button variant="ghost" size="icon" asChild>
                        <Link href="/checkout">
                            <div className="relative">
                                <ShoppingBag className="h-6 w-6" />
                                {isClient && cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="sr-only">Shopping Cart</span>
                        </Link>
                    </Button>

                    <div className="md:hidden">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <div className="p-6">
                                    <Link href="/" className="flex items-center gap-2 mb-8">
                                        <Image 
                                            src="https://i.imgur.com/k7qYBOW.png" 
                                            alt="Freesia Finds Logo" 
                                            width={40} 
                                            height={40} 
                                            className="rounded-md"
                                            data-ai-hint="logo"
                                        />
                                        <span className="font-bold font-headline text-lg text-primary">Freesia Finds</span>
                                    </Link>
                                    <nav className="flex flex-col gap-4">
                                        {navLinks.map(link => (
                                            <Link 
                                                key={link.name} 
                                                href={link.href} 
                                                className="text-lg font-medium"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
