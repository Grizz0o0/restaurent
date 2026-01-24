'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Types
type Category = {
    id: string;
    name: string;
    slug: string;
};

type Dish = {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price_vnd: number;
    image_url: string | null;
    is_active: boolean;
};

// Mock Data
const mockCategories: Category[] = [
    { id: 'cat_1', name: 'Bánh Mì', slug: 'banh-mi' },
    { id: 'cat_2', name: 'Đồ Uống', slug: 'do-uong' },
    { id: 'cat_3', name: 'Combo', slug: 'combo' },
];

const mockDishes: Dish[] = [
    {
        id: '1',
        name: 'Bánh Mì Thịt Nướng',
        description:
            'Thịt heo nướng than hoa, rau tươi, đồ chua, nước sốt đặc biệt',
        price_vnd: 35000,
        category_id: 'cat_1',
        image_url: null,
        is_active: true,
    },
    {
        id: '2',
        name: 'Cà Phê Sữa Đá',
        description: 'Cà phê rang xay nguyên chất',
        price_vnd: 25000,
        category_id: 'cat_2',
        image_url: null,
        is_active: true,
    },
];

const dishSchema = z.object({
    name: z.string().trim().min(1, 'Tên món không được trống').max(200),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    price_vnd: z.number().int().min(0).max(1_000_000_000),
    category_id: z.string().optional().or(z.literal('')),
    image_url: z
        .string()
        .trim()
        .url('Image URL không hợp lệ')
        .max(1000)
        .optional()
        .or(z.literal('')),
    is_active: z.boolean(),
});

type DishFormValues = z.infer<typeof dishSchema>;

export default function AdminPage() {
    // In real app: useQuery from TRPC
    const categories = mockCategories;
    const [dishes, setDishes] = useState<Dish[]>(mockDishes);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Dish | null>(null);

    const form = useForm<DishFormValues>({
        resolver: zodResolver(dishSchema),
        defaultValues: {
            name: '',
            description: '',
            price_vnd: 0,
            category_id: '',
            image_url: '',
            is_active: true,
        },
    });

    const categoryNameById = useMemo(() => {
        const map = new Map<string, string>();
        categories.forEach((c) => map.set(c.id, c.name));
        return map;
    }, [categories]);

    // Handlers
    const openCreate = () => {
        setEditing(null);
        form.reset({
            name: '',
            description: '',
            price_vnd: 0,
            category_id: '',
            image_url: '',
            is_active: true,
        });
        setOpen(true);
    };

    const openEdit = (dish: Dish) => {
        setEditing(dish);
        form.reset({
            name: dish.name,
            description: dish.description ?? '',
            price_vnd: dish.price_vnd,
            category_id: dish.category_id ?? '',
            image_url: dish.image_url ?? '',
            is_active: dish.is_active,
        });
        setOpen(true);
    };

    const onSubmit = async (values: DishFormValues) => {
        // MOCK UPSERT
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (editing) {
            setDishes((prev) =>
                prev.map((d) =>
                    d.id === editing.id ? { ...d, ...values, id: d.id } : d,
                ),
            );
            toast.success('Đã cập nhật món');
        } else {
            const newDish: Dish = {
                id: Math.random().toString(36).substr(2, 9),
                ...values,
                category_id: values.category_id || null,
                description: values.description || null,
                image_url: values.image_url || null,
            };
            setDishes((prev) => [newDish, ...prev]);
            toast.success('Đã tạo món');
        }

        setOpen(false);
        setEditing(null);
        form.reset();
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa món này?')) {
            setDishes((prev) => prev.filter((d) => d.id !== id));
            toast.success('Đã xóa món');
        }
    };

    const formatVnd = (vnd: number) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(vnd);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-20 md:py-24">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                Admin
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Quản lý món ăn (CRUD).
                            </p>
                        </div>

                        <Dialog
                            open={open}
                            onOpenChange={(v) => {
                                setOpen(v);
                                if (!v) setEditing(null);
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button variant="hero" onClick={openCreate}>
                                    <Plus className="w-4 h-4" />
                                    Thêm món
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="font-display">
                                        {editing ? 'Sửa món' : 'Thêm món'}
                                    </DialogTitle>
                                </DialogHeader>

                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Tên món
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Bánh mì thịt nướng"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mô tả</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            rows={4}
                                                            placeholder="Mô tả ngắn..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="price_vnd"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Giá (VND)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step={1000}
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="category_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Danh mục
                                                        </FormLabel>
                                                        <Select
                                                            value={
                                                                field.value ||
                                                                ''
                                                            }
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="(Không chọn)" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="">
                                                                    (Không chọn)
                                                                </SelectItem>
                                                                {categories.map(
                                                                    (c) => (
                                                                        <SelectItem
                                                                            key={
                                                                                c.id
                                                                            }
                                                                            value={
                                                                                c.id
                                                                            }
                                                                        >
                                                                            {
                                                                                c.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="image_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Image URL
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                type="submit"
                                                variant="hero"
                                                className="flex-1"
                                            >
                                                {editing ? 'Lưu' : 'Tạo mới'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-28"
                                                onClick={() => setOpen(false)}
                                            >
                                                Đóng
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card className="rounded-2xl shadow-card border-border">
                        <CardHeader>
                            <CardTitle className="font-display">
                                Danh sách món
                            </CardTitle>
                            <CardDescription>
                                Chỉ tài khoản admin mới thao tác được.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {dishes.length === 0 ? (
                                    <p className="text-muted-foreground">
                                        Chưa có món nào. Bấm “Thêm món” để tạo.
                                    </p>
                                ) : (
                                    dishes.map((dish) => (
                                        <div
                                            key={dish.id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-secondary/30 border border-border rounded-xl p-4 transition-all hover:bg-secondary/50"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-foreground truncate">
                                                        {dish.name}
                                                    </p>
                                                    {!dish.is_active && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            Ẩn
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {categoryNameById.get(
                                                        dish.category_id ?? '',
                                                    )
                                                        ? `Danh mục: ${categoryNameById.get(dish.category_id ?? '')}`
                                                        : 'Danh mục: (không)'}
                                                    {' • '}
                                                    {formatVnd(dish.price_vnd)}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEdit(dish)
                                                    }
                                                >
                                                    <Pencil className="w-4 h-4 mr-1" />{' '}
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(dish.id)
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />{' '}
                                                    Xóa
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
