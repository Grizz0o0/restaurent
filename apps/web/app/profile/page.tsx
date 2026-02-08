'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/profile-form';
import { OrderHistory } from '@/components/profile/order-history';
import { AddressList } from '@/components/profile/address-list';

import { useAuth } from '@/hooks/domain/use-auth';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-8 text-center">Đang tải...</div>;
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
                <p className="text-muted-foreground mb-8">
                    Vui lòng đăng nhập để xem hồ sơ và lịch sử đơn hàng
                </p>
                <Button onClick={() => (window.location.href = '/auth/login')}>
                    Đăng nhập ngay
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Hồ sơ của tôi
                    </h2>
                    <p className="text-muted-foreground">
                        Quản lý thông tin cá nhân và xem lịch sử đơn hàng.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="account">
                        Thông tin tài khoản
                    </TabsTrigger>
                    <TabsTrigger value="orders">Lịch sử đơn hàng</TabsTrigger>
                    <TabsTrigger value="addresses">Sổ địa chỉ</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="space-y-4">
                    <ProfileForm />
                </TabsContent>
                <TabsContent value="orders" className="space-y-4">
                    <OrderHistory />
                </TabsContent>
                <TabsContent value="addresses" className="space-y-4">
                    <AddressList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
