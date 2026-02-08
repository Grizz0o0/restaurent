'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, Package, ChevronDown, ChevronUp } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/lib/utils/format';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Image from 'next/image';

const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    PENDING_CONFIRMATION: {
        label: 'Chờ xác nhận',
        color: 'bg-yellow-100 text-yellow-800',
    },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
    PREPARING: {
        label: 'Đang chuẩn bị',
        color: 'bg-indigo-100 text-indigo-800',
    },
    READY: { label: 'Sẵn sàng', color: 'bg-purple-100 text-purple-800' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export function OrderHistory() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = trpc.order.myOrders.useQuery({
        page,
        limit: 10,
    });

    const orders = data?.data || [];
    const pagination = data?.pagination;

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Chưa có đơn hàng nào</h3>
                <p className="text-muted-foreground mb-4">
                    Bạn chưa đặt đơn hàng nào. Hãy khám phá thực đơn của chúng
                    tôi!
                </p>
                <Button asChild variant="hero">
                    <a href="/menu">Xem thực đơn</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="border rounded-lg bg-card overflow-hidden"
                >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">
                                    #{order.id.slice(-6).toUpperCase()}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className={`${statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'} border-none`}
                                >
                                    {statusMap[order.status]?.label ||
                                        order.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {format(
                                    new Date(order.createdAt),
                                    'HH:mm dd/MM/yyyy',
                                    {
                                        locale: vi,
                                    },
                                )}
                            </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium">Tổng tiền</p>
                                <p className="text-lg font-bold text-primary">
                                    {formatCurrency(Number(order.totalAmount))}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Order Items Summary */}
                    <div className="px-4 pb-4">
                        <div className="text-sm text-muted-foreground">
                            {order.items
                                .map(
                                    (item: any) =>
                                        `${item.quantity}x ${item.dishName}`,
                                )
                                .join(', ')}
                        </div>
                    </div>
                </div>
            ))}

            {/* Simple Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrev}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Trước
                    </Button>
                    <span className="flex items-center text-sm font-medium">
                        Trang {data.pagination.page} /{' '}
                        {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNext}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Sau
                    </Button>
                </div>
            )}
        </div>
    );
}
