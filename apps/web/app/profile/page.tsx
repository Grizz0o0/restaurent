'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const schema = z.object({
    display_name: z.string().trim().max(100).optional().or(z.literal('')),
    phone: z.string().trim().max(50).optional().or(z.literal('')),
    address: z.string().trim().max(500).optional().or(z.literal('')),
    avatar_url: z
        .string()
        .trim()
        .url('Avatar URL không hợp lệ')
        .max(1000)
        .optional()
        .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

// Mock data
const mockProfile = {
    display_name: 'Khách hàng thân thiết',
    phone: '0909 123 456',
    address: '123 Đường Bánh Mì, Quận 1',
    avatar_url: '',
    email: 'khachhang@example.com',
    id: 'user_12345',
};

export default function ProfilePage() {
    const [saving, setSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            display_name: mockProfile.display_name,
            phone: mockProfile.phone,
            address: mockProfile.address,
            avatar_url: mockProfile.avatar_url,
        },
    });

    const onSubmit = async (values: FormValues) => {
        setSaving(true);
        console.log('Update profile:', values);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSaving(false);
        toast.success('Đã lưu hồ sơ');
    };

    const handleSignOut = () => {
        toast.info('Đã đăng xuất');
        // Implement logout logic
        window.location.href = '/auth/login';
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-20 md:py-24">
                <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
                    <Card className="rounded-2xl shadow-card border-border">
                        <CardHeader>
                            <CardTitle className="font-display text-2xl">
                                Hồ sơ
                            </CardTitle>
                            <CardDescription>
                                Cập nhật thông tin để đặt hàng nhanh hơn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg">
                                <div className="flex justify-between py-1">
                                    <span>Email:</span>
                                    <span className="text-foreground font-medium">
                                        {mockProfile.email}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span>User ID:</span>
                                    <span className="text-foreground font-medium">
                                        {mockProfile.id}
                                    </span>
                                </div>
                            </div>

                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="grid gap-5"
                                >
                                    <FormField
                                        control={form.control}
                                        name="display_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Tên hiển thị
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ví dụ: Minh"
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
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Số điện thoại
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="0909 123 456"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="avatar_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Avatar URL
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
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Địa chỉ</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="123 Nguyễn Huệ, Q.1"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            variant="hero"
                                            className="sm:flex-1"
                                            disabled={saving}
                                        >
                                            {saving
                                                ? 'Đang lưu...'
                                                : 'Lưu hồ sơ'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="sm:w-48 text-destructive hover:text-destructive"
                                            onClick={handleSignOut}
                                        >
                                            Đăng xuất
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
