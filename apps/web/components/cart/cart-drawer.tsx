'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/stores/use-cart-store';
import { useUIStore } from '@/stores/use-ui-store';
import { formatCurrency } from '@/lib/utils/format';

export function CartDrawer() {
    const { items, removeItem, updateQuantity } = useCartStore();
    const { isCartOpen, setCartOpen } = useUIStore();

    const totalAmount = items.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0,
    );

    return (
        <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
            <SheetContent
                className="w-full sm:max-w-md flex flex-col p-0 gap-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl font-display">
                        <ShoppingBag className="w-5 h-5" />
                        Giỏ hàng ({items.length})
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">
                                    Giỏ hàng trống
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Hãy thêm vài món ngon vào đây nhé!
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link
                                    href="/menu"
                                    onClick={() => setCartOpen(false)}
                                >
                                    Tiếp tục xem menu
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {items.map((item) => (
                                <div
                                    key={item.skuId}
                                    className="flex gap-4 items-start animate-fade-in"
                                >
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.dishName || 'Item'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                No img
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-sm line-clamp-2">
                                                {item.dishName}
                                            </h4>
                                            <button
                                                onClick={() =>
                                                    removeItem(item.skuId)
                                                }
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {item.variantOptions &&
                                            item.variantOptions.length > 0 && (
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {item.variantOptions.join(
                                                        ', ',
                                                    )}
                                                </p>
                                            )}

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-full"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.skuId,
                                                            Math.max(
                                                                1,
                                                                item.quantity -
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="text-sm font-medium w-4 text-center">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-full"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.skuId,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <span className="font-semibold text-sm">
                                                {formatCurrency(
                                                    (item.price || 0) *
                                                        item.quantity,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {items.length > 0 && (
                    <div className="p-6 border-t bg-background space-y-4">
                        <div className="flex items-center justify-between text-base">
                            <span className="text-muted-foreground">
                                Tạm tính
                            </span>
                            <span className="font-bold text-lg">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        <Button
                            className="w-full"
                            size="lg"
                            variant="hero"
                            asChild
                        >
                            <Link
                                href="/checkout"
                                onClick={() => setCartOpen(false)}
                            >
                                Thanh toán ngay
                            </Link>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
