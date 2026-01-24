'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, Minus, Plus } from 'lucide-react';
import Image from 'next/image';

// Placeholder images
import banhMiThitNuong from '@/assets/banh-mi-thit-nuong.jpg';
// We might need to map real dish IDs to images if fetching from API,
// OR just use placeholder for all if images are URLs.
// For now, I'll fetch dishes from API.

interface CartItem {
    dishId: string;
    dishName: string;
    price: number;
    quantity: number;
}

export default function GuestTablePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const tableId = params.id as string;
    const token = searchParams.get('token');

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);

    const loginMutation = trpc.auth.guestLogin.useMutation({
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            setIsLoggedIn(true);
            toast.success('Welcome! You are connected to the table.');
            refetchDishes();
        },
        onError: (err) => {
            toast.error('Failed to login to table: ' + err.message);
        },
    });

    const createOrderMutation = trpc.order.create.useMutation({
        onSuccess: (data) => {
            toast.success('Order placed successfully!');
            setCart([]);
        },
        onError: (err) => {
            toast.error('Failed to place order: ' + err.message);
        },
    });

    // Fetch Dishes
    const {
        data: dishesData,
        refetch: refetchDishes,
        isLoading,
    } = trpc.dish.list.useQuery(
        {
            page: 1,
            limit: 50,
        },
        {
            enabled: isLoggedIn,
        },
    );

    useEffect(() => {
        if (token && tableId && !isLoggedIn) {
            loginMutation.mutate({ tableId, token });
        }
    }, [token, tableId]);

    const addToCart = (dish: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.dishId === dish.id);
            if (existing) {
                return prev.map((item) =>
                    item.dishId === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }
            return [
                ...prev,
                {
                    dishId: dish.id,
                    dishName: dish.name,
                    price: Number(dish.basePrice),
                    quantity: 1,
                },
            ];
        });
        toast.success(`Added ${dish.name} to cart`);
    };

    const removeFromCart = (dishId: string) => {
        setCart((prev) => prev.filter((item) => item.dishId !== dishId));
    };

    const updateQuantity = (dishId: string, delta: number) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.dishId === dishId) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null as any;
                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        createOrderMutation.mutate({
            tableId,
            items: cart.map((item) => ({
                dishId: item.dishId,
                quantity: item.quantity,
                // note: ''
            })),
        });
    };

    const totalPrice = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
    );

    if (!token)
        return (
            <div className="p-10 text-center">
                Missing Token. Please scan the QR code closely.
            </div>
        );
    if (loginMutation.isPending)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" /> Auto-logging in...
            </div>
        );

    // Fallback if generic dishes fetch fails, might show empty or error?
    // Using simple UI
    return (
        <div className="container max-w-lg mx-auto py-6 pb-24 px-4">
            <h1 className="text-2xl font-bold mb-4">Table {tableId} Menu</h1>

            {isLoading && <p>Loading menu...</p>}

            <div className="grid gap-4">
                {dishesData?.data.map((dish: any) => (
                    <Card
                        key={dish.id}
                        className="flex flex-row overflow-hidden items-center p-2 gap-3"
                    >
                        <div className="w-20 h-20 bg-muted rounded relative overflow-hidden flex-shrink-0">
                            {/* Image placeholder */}
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-xs">
                                IMG
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">{dish.name}</h3>
                            <p className="text-primary font-bold">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(Number(dish.basePrice))}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => addToCart(dish)}
                            variant="secondary"
                        >
                            Add
                        </Button>
                    </Card>
                ))}
            </div>

            {/* Floating Cart */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg pb-safe">
                    <div className="container max-w-lg mx-auto">
                        <div className="mb-4 max-h-40 overflow-auto">
                            {cart.map((item) => (
                                <div
                                    key={item.dishId}
                                    className="flex justify-between items-center mb-2 text-sm"
                                >
                                    <span>{item.dishName}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.dishId, -1)
                                            }
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.dishId, 1)
                                            }
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleCheckout}
                            disabled={createOrderMutation.isPending}
                        >
                            {createOrderMutation.isPending
                                ? 'Placing Order...'
                                : `Place Order • ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}`}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
