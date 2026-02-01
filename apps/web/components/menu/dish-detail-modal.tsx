'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/lib/utils/format';
import { useCartStore } from '@/stores/use-cart-store';
import { toast } from 'sonner';
import Image from 'next/image';

interface DishDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    dishId: string | null;
}

export function DishDetailModal({
    isOpen,
    onClose,
    dishId,
}: DishDetailModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<
        Record<string, string>
    >({});

    const { data: dish, isLoading } = trpc.dish.detail.useQuery(
        { id: dishId as string },
        {
            enabled: !!dishId && isOpen,
        },
    );

    useEffect(() => {
        if (!isOpen) {
            setQuantity(1);
            setSelectedOptions({});
        }
    }, [isOpen]);

    // Find matching SKU based on selected options
    const matchingSku = dish?.skus?.find((sku: any) => {
        if (!sku.variantOptions || !dish.variants) return false;

        // Ensure all variants are selected
        const selectedOptionIds = Object.values(selectedOptions);
        if (selectedOptionIds.length !== dish.variants.length) return false;

        // Check if SKU contains all selected options
        // SKU.variantOptions is array of objects { id, value ... }
        const skuOptionIds = sku.variantOptions.map((o: any) => o.id);
        return selectedOptionIds.every((id) => skuOptionIds.includes(id));
    }) as any;

    // Fallback price if no variants: basePrice.
    // If variants exist but no SKU match: null (unavailable).
    const currentPrice =
        dish?.variants && dish.variants.length > 0
            ? matchingSku?.price
            : dish?.basePrice;

    const handleOptionSelect = (variantId: string, optionId: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [variantId]: optionId,
        }));
    };

    const handleAddToCart = () => {
        if (!dish) return;

        // Logic check
        if (dish.variants && dish.variants.length > 0) {
            if (!matchingSku) {
                toast.error('Vui lòng chọn đầy đủ các tùy chọn');
                return;
            }
            if (!currentPrice) return;

            addItem({
                skuId: matchingSku.id,
                quantity,
                dishName: dish.name || '',
                price: Number(currentPrice),
                image: matchingSku.images?.[0] || dish.images?.[0],
                variantOptions: matchingSku.variantOptions?.map(
                    (o: any) => o.value,
                ),
            });
        } else {
            // No variants case (assuming there's a default SKU or we handle base dish as item)
            // Typically system creates a default SKU for no-variant dish.
            // If not, we might fail. Let's assume default SKU exists or we find one without options.
            const defaultSku = dish.skus?.find(
                (s: any) => !s.variantOptions || s.variantOptions.length === 0,
            );
            if (defaultSku) {
                addItem({
                    skuId: defaultSku.id,
                    quantity,
                    dishName: dish.name || '',
                    price: Number(defaultSku.price),
                    image: defaultSku.images?.[0] || dish.images?.[0],
                });
            } else {
                toast.error('Sản phẩm này tạm thời không khả dụng (Lỗi SKU)');
                return;
            }
        }

        toast.success(`Đã thêm ${quantity} ${dish.name} vào giỏ`);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
                {isLoading || !dish ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                                {dish.images?.[0] ? (
                                    <Image
                                        src={dish.images[0]}
                                        alt={dish.name || 'Dish'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <DialogTitle className="text-2xl font-display">
                                {dish.name}
                            </DialogTitle>
                            <DialogDescription>
                                {dish.description}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Variants */}
                            {dish.variants?.map((variant: any) => (
                                <div key={variant.id} className="space-y-3">
                                    <Label className="text-base font-semibold">
                                        {variant.name}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <RadioGroup
                                        value={selectedOptions[variant.id]}
                                        onValueChange={(val) =>
                                            handleOptionSelect(variant.id, val)
                                        }
                                        className="flex flex-wrap gap-2"
                                    >
                                        {variant.options.map((option: any) => (
                                            <div key={option.id}>
                                                <RadioGroupItem
                                                    value={option.id}
                                                    id={option.id}
                                                    className="peer sr-only"
                                                />
                                                <Label
                                                    htmlFor={option.id}
                                                    className="flex items-center justify-center rounded-md border border-muted bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                                                >
                                                    {option.value}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}

                            {/* Quantity */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="font-semibold">Số lượng</span>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1),
                                            )
                                        }
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2 items-center border-t pt-4">
                            <div className="flex-1 text-xl font-bold text-primary">
                                {currentPrice
                                    ? formatCurrency(
                                          Number(currentPrice) * quantity,
                                      )
                                    : '--'}
                            </div>
                            <Button
                                className="w-full sm:w-auto"
                                size="lg"
                                variant="hero"
                                onClick={handleAddToCart}
                                disabled={
                                    !currentPrice ||
                                    (dish.variants &&
                                        dish.variants.length > 0 &&
                                        !matchingSku)
                                }
                            >
                                Thêm vào giỏ -{' '}
                                {currentPrice
                                    ? formatCurrency(
                                          Number(currentPrice) * quantity,
                                      )
                                    : 'Chọn tùy chọn'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
