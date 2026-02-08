'use client';

import { OrderHistory } from '@/components/profile/order-history';
import { useAuth } from '@/hooks/domain/use-auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function OrdersPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-8 text-center">Đang tải...</div>;
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
                <p className="text-muted-foreground mb-8">
                    Vui lòng đăng nhập để xem lịch sử đơn hàng
                </p>
                <Button onClick={() => (window.location.href = '/auth/login')}>
                    Đăng nhập ngay
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Lịch sử đơn hàng</h3>
                <p className="text-sm text-muted-foreground">
                    Xem lại lịch sử các đơn hàng bạn đã đặt.
                </p>
            </div>
            <Separator />
            <OrderHistory />
        </div>
    );
}
