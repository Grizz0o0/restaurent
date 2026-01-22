'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

import banhMiThitNuong from '@/assets/banh-mi-thit-nuong.jpg';
import banhMiChaLua from '@/assets/banh-mi-cha-lua.jpg';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: any; // Using any for imported image object from Next.js (StaticImageData)
}

const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: 1,
            name: 'Bánh Mì Thịt Nướng',
            price: 35000,
            quantity: 2,
            image: banhMiThitNuong,
        },
        {
            id: 2,
            name: 'Bánh Mì Chả Lụa',
            price: 25000,
            quantity: 1,
            image: banhMiChaLua,
        },
    ]);

    const updateQuantity = (id: number, delta: number) => {
        setCartItems((items) =>
            items
                .map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              quantity: Math.max(0, item.quantity + delta),
                          }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const removeItem = (id: number) => {
        setCartItems((items) => items.filter((item) => item.id !== id));
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const deliveryFee = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + deliveryFee;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <header className="bg-secondary/50 border-b border-border">
                    <div className="container mx-auto px-4 py-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Về trang chủ</span>
                        </Link>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                            Giỏ Hàng
                        </h1>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-24 text-center">
                    <ShoppingBag className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                        Giỏ hàng trống
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Hãy thêm một vài món bánh mì ngon vào giỏ hàng của bạn
                    </p>
                    <Link href="/menu">
                        <Button variant="hero">Xem thực đơn</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-secondary/50 border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Về trang chủ</span>
                    </Link>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                        Giỏ Hàng
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {cartItems.length} sản phẩm trong giỏ hàng
                    </p>
                </div>
            </header>

            {/* Cart Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 bg-card p-4 rounded-2xl border border-border"
                            >
                                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-display font-bold text-foreground truncate">
                                        {item.name}
                                    </h3>
                                    <p className="text-primary font-medium mt-1">
                                        {formatPrice(item.price)}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id, -1)
                                                }
                                                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id, 1)
                                                }
                                                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-chili transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Tiếp tục mua sắm
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
                            <h2 className="font-display text-xl font-bold text-foreground mb-6">
                                Tóm tắt đơn hàng
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Phí giao hàng</span>
                                    <span>
                                        {deliveryFee === 0 ? (
                                            <span className="text-herb">
                                                Miễn phí
                                            </span>
                                        ) : (
                                            formatPrice(deliveryFee)
                                        )}
                                    </span>
                                </div>
                                {subtotal < 100000 && (
                                    <p className="text-xs text-muted-foreground">
                                        Miễn phí giao hàng cho đơn từ{' '}
                                        {formatPrice(100000)}
                                    </p>
                                )}
                                <div className="h-px bg-border" />
                                <div className="flex justify-between font-bold text-foreground text-lg">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            </div>

                            <Button variant="hero" className="w-full" size="lg">
                                Tiến hành thanh toán
                            </Button>

                            <p className="text-xs text-muted-foreground text-center mt-4">
                                Thanh toán an toàn và bảo mật
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Cart;
