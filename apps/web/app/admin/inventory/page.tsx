'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    useForm,
    type Resolver,
    type SubmitHandler,
    type UseFormReturn,
} from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    Package,
    AlertTriangle,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@/hooks/domain/use-auth';

// Schema matching CreateInventoryBodyType
const inventorySchema = z.object({
    restaurantId: z.string().uuid(),
    itemName: z.string().trim().min(1, 'Tên mặt hàng không được trống'),
    quantity: z.coerce.number().min(0, 'Số lượng không hợp lệ'),
    unit: z.string().trim().min(1, 'Đơn vị tính không được trống'),
    threshold: z.coerce
        .number()
        .min(0, 'Ngưỡng tối thiểu không hợp lệ')
        .optional(),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

// Types for REST API response
interface InventoryItem {
    id: string;
    restaurantId: string;
    itemName: string;
    quantity: number;
    unit: string;
    threshold: number | null;
    createdAt: string;
    updatedAt: string;
}

export default function AdminInventoryPage() {
    // 1. Get User/Auth Info
    const { user } = useAuth();
    // 2. We need a restaurantId. Assuming simpler setup: fetch first restaurant or user's restaurant
    // If not in user object, we try to fetch list
    const { data: restaurants } = trpc.restaurant.list.useQuery(
        {},
        {
            enabled: !user?.roleId, // Always fetch if uncertain, simplify logic
        },
    );

    // Determine restaurantId: preferably from context or first available
    // For now, we'll try to use the first one from the list if available
    const restaurantId = restaurants?.items?.[0]?.id;

    // 3. REST API State
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 4. Form & UI State
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<InventoryItem | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<InventoryFormValues>({
        resolver: zodResolver(inventorySchema) as Resolver<InventoryFormValues>,
        defaultValues: {
            restaurantId: '',
            itemName: '',
            quantity: 0,
            unit: 'kg',
            threshold: 5,
        },
    });

    // Fetch Inventory Data via REST
    const fetchInventory = async () => {
        try {
            setIsRefreshing(true);
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL?.replace('/trpc', '') || 'http://localhost:3052/v1/api'}/inventories?limit=100`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (!res.ok) throw new Error('Failed to fetch inventory');
            const data = await res.json();
            // data might be array or { data: [] } depending on backend. Controller findAll returns direct array or paged?
            // Controller: returns findMany result directly or handled by interceptor?
            // Assuming TransformInterceptor wraps it in { statusCode, message, data }
            const items = data.data || data;
            setInventoryItems(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải dữ liệu kho hàng');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // Effect to set restaurantId in form when available
    useEffect(() => {
        if (restaurantId && !editing) {
            form.setValue('restaurantId', restaurantId);
        }
    }, [restaurantId, editing, form]);

    // Handlers
    const openCreate = () => {
        if (!restaurantId) {
            toast.error('Không tìm thấy thông tin nhà hàng');
            return;
        }
        setEditing(null);
        form.reset({
            restaurantId: restaurantId,
            itemName: '',
            quantity: 0,
            unit: 'kg',
            threshold: 5,
        });
        setOpen(true);
    };

    const openEdit = (item: InventoryItem) => {
        setEditing(item);
        form.reset({
            restaurantId: item.restaurantId,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            threshold: item.threshold || 0,
        });
        setOpen(true);
    };

    const onSubmit: SubmitHandler<InventoryFormValues> = async (values) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('accessToken');
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL?.replace('/trpc', '') ||
                'http://localhost:3052/v1/api';
            const url = editing
                ? `${baseUrl}/inventories/${editing.id}`
                : `${baseUrl}/inventories`;
            const method = editing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save');
            }

            toast.success(
                editing ? 'Đã cập nhật kho hàng' : 'Đã thêm mặt hàng mới',
            );
            setOpen(false);
            fetchInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem('accessToken');
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL?.replace('/trpc', '') ||
                'http://localhost:3052/v1/api';
            const res = await fetch(`${baseUrl}/inventories/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.success('Đã xóa mặt hàng');
            setDeleteId(null);
            fetchInventory();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa');
        }
    };

    const filteredItems = useMemo(() => {
        return inventoryItems.filter((item) =>
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [inventoryItems, searchQuery]);

    const stats = useMemo(() => {
        const totalItems = inventoryItems.length;
        const lowStock = inventoryItems.filter(
            (i) => i.threshold !== null && i.quantity <= i.threshold,
        ).length;
        return { totalItems, lowStock };
    }, [inventoryItems]);

    return (
        <div className="flex flex-col p-6 w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                        Quản lý kho hàng
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Theo dõi số lượng hàng tồn kho và cảnh báo nhập hàng.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchInventory}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Làm mới'
                        )}
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="hero"
                                onClick={openCreate}
                                className="gap-2 shadow-lg hover:shadow-primary/25"
                                disabled={!restaurantId}
                            >
                                <Plus className="w-4 h-4" />
                                Thêm mặt hàng
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editing
                                        ? 'Chỉnh sửa mặt hàng'
                                        : 'Thêm mặt hàng mới'}
                                </DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit((data) =>
                                        onSubmit(data),
                                    )}
                                    className="space-y-4 pt-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="itemName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Tên mặt hàng
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Gạo, Thịt, Rau..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Số lượng tồn
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="unit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Đơn vị tính
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn đơn vị" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="kg">
                                                                kg
                                                            </SelectItem>
                                                            <SelectItem value="g">
                                                                g
                                                            </SelectItem>
                                                            <SelectItem value="l">
                                                                lít
                                                            </SelectItem>
                                                            <SelectItem value="ml">
                                                                ml
                                                            </SelectItem>
                                                            <SelectItem value="pcs">
                                                                cái/hộp
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="threshold"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Ngưỡng cảnh báo (Tối thiểu)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpen(false)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting && (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            )}
                                            {editing ? 'Cập nhật' : 'Tạo mới'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng mặt hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalItems}
                        </div>
                    </CardContent>
                </Card>
                <Card className={stats.lowStock > 0 ? 'border-amber-500' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Cảnh báo sắp hết
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {stats.lowStock}
                            {stats.lowStock > 0 && (
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm mặt hàng..."
                    className="pl-9 max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                            <Package className="h-12 w-12 mb-2 opacity-20" />
                            <p>Chưa có dữ liệu kho hàng</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 font-medium">
                                    <tr>
                                        <th className="p-4">Tên mặt hàng</th>
                                        <th className="p-4">Số lượng</th>
                                        <th className="p-4">Đơn vị</th>
                                        <th className="p-4">Ngưỡng</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4 text-right">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <td className="p-4 font-medium">
                                                {item.itemName}
                                            </td>
                                            <td className="p-4">
                                                {item.quantity}
                                            </td>
                                            <td className="p-4">{item.unit}</td>
                                            <td className="p-4">
                                                {item.threshold || '-'}
                                            </td>
                                            <td className="p-4">
                                                {item.threshold !== null &&
                                                item.quantity <=
                                                    item.threshold ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="gap-1"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Sắp hết
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-500/10 text-green-600 border-green-200"
                                                    >
                                                        Đủ hàng
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            openEdit(item)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            setDeleteId(item.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa mặt hàng này khỏi kho?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
