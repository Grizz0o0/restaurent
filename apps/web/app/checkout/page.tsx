'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/domain/use-auth';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Loader2, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
    const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const utils = trpc.useUtils();

    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Cart Data to display summary
    const { data: cartData, isLoading: isCartLoading } = trpc.cart.get.useQuery(
        undefined,
        { enabled: isAuthenticated },
    );

    // Auto-fill address from profile if available
    useEffect(() => {
        if (user?.translations?.[0]?.address) {
            setAddress(user.translations[0].address);
        }
    }, [user]);

    const createOrderMutation = trpc.order.createFromCart.useMutation({
        onSuccess: (order) => {
            toast.success('Đặt hàng thành công!');
            utils.cart.get.invalidate();
            router.push(`/checkout/success?orderId=${order.id}`);
        },
        onError: (error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
            setIsSubmitting(false);
        },
    });

    const handlePlaceOrder = () => {
        if (!address.trim()) {
            toast.error('Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        setIsSubmitting(true);
        createOrderMutation.mutate({
            // We pass extra guestInfo for address even if logged in,
            // or we might need to update Address in backend logic if we want to save it to Order.
            // The CreateOrderFromCartSchema has guestInfo: z.any().optional().
            // Ideally backend receives shipping address.
            // Let's pass it in guestInfo for now or we might need to update schema to explicit shippingAddress.
            // Looking at CreateOrderFromCartSchema: guestInfo is optional any.
            guestInfo: {
                address: address,
                paymentMethod: paymentMethod,
                phoneNumber: user?.phoneNumber,
            },
            promotionCode: undefined, // Add logic for this later if needed
        });
    };

    if (isAuthLoading || isCartLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push('/auth/login?redirect=/checkout');
        return null;
    }

    if (!cartData || cartData.items.length === 0) {
        router.push('/cart');
        return null;
    }

    const subtotal = cartData.totalPrice || 0;
    const deliveryFee = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + deliveryFee;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container px-4 md:px-6">
                <h1 className="text-3xl font-bold font-display mb-8">
                    Thanh toán
                </h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Address & Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Thông tin giao hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Người nhận</Label>
                                    <Input
                                        id="name"
                                        value={user?.name || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={user?.phoneNumber || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">
                                        Địa chỉ nhận hàng
                                    </Label>
                                    <Input
                                        id="address"
                                        placeholder="Số nhà, tên đường, phường/xã..."
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Phương thức thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                    className="grid gap-4"
                                >
                                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                                        <RadioGroupItem value="COD" id="cod" />
                                        <Label
                                            htmlFor="cod"
                                            className="flex-1 cursor-pointer"
                                        >
                                            Thanh toán khi nhận hàng (COD)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                                        <RadioGroupItem
                                            value="BANKing"
                                            id="banking"
                                        />
                                        <Label
                                            htmlFor="banking"
                                            className="flex-1 cursor-pointer"
                                        >
                                            Chuyển khoản ngân hàng
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Đơn hàng của bạn</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Items List (Simplified) */}
                                <div className="space-y-4 max-h-75 overflow-y-auto pr-2">
                                    {cartData.items.map((item: any) => {
                                        const dishName =
                                            item.sku?.dish
                                                ?.dishTranslations?.[0]?.name ||
                                            'Món ăn';
                                        const image =
                                            item.sku?.dish?.images?.[0] ||
                                            '/images/placeholder-dish.jpg';
                                        const price = Number(
                                            item.sku?.price || 0,
                                        );

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex gap-3"
                                            >
                                                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                                                    <Image
                                                        src={image}
                                                        alt={dishName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {dishName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        SL: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {formatPrice(
                                                        price * item.quantity,
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Separator />

                                {/* Calculations */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Tạm tính
                                        </span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Phí vận chuyển
                                        </span>
                                        <span>
                                            {deliveryFee === 0
                                                ? 'Miễn phí'
                                                : formatPrice(deliveryFee)}
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng</span>
                                        <span className="text-primary">
                                            {formatPrice(total)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isSubmitting
                                        ? 'Đang xử lý...'
                                        : 'Đặt hàng'}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>
                                        Thông tin được bảo mật tuyệt đối
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
