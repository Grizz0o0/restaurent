'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/domain/use-auth';
import { trpc } from '@/lib/trpc/client';
import { Separator } from '@/components/ui/separator';

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

export function ProfileForm() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const utils = trpc.useUtils();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            display_name: '',
            phone: '',
            address: '',
            avatar_url: '',
        },
    });

    // Populate form when user data is available
    useEffect(() => {
        if (user) {
            form.reset({
                display_name: user.name || '',
                phone: user.phoneNumber || '',
                address: user.translations?.[0]?.address || '', // Taking the first translation address for now
                avatar_url: user.avatar || '',
            });
        }
    }, [user, form]);

    const updateProfileMutation = trpc.profile.updateProfile.useMutation({
        onSuccess: () => {
            toast.success('Đã lưu hồ sơ');
            utils.profile.getProfile.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || 'Cập nhật hồ sơ thất bại');
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            await updateProfileMutation.mutateAsync({
                name: values.display_name || undefined,
                phoneNumber: values.phone || undefined,
                avatar: values.avatar_url || undefined,
                // Address update is complex due to translations, skipping for now unless we have a languageId
                // translations: ...
            });
        } catch (error) {
            // Handled in onError
        }
    };

    if (isAuthLoading) {
        return <p>Đang tải...</p>;
    }

    if (!user) {
        return (
            <div className="text-center">
                <p className="mb-4">Bạn chưa đăng nhập</p>
                <Button onClick={() => (window.location.href = '/auth/login')}>
                    Đăng nhập ngay
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
                <p className="text-sm text-muted-foreground">
                    Cập nhật thông tin cá nhân và địa chỉ nhận hàng.
                </p>
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="display_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên hiển thị</FormLabel>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số điện thoại</FormLabel>
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
                                    <FormLabel>Avatar URL</FormLabel>
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
                                <FormLabel>Địa chỉ (Chỉ xem)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Chưa có địa chỉ"
                                        {...field}
                                        disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending
                                ? 'Đang lưu...'
                                : 'Lưu hồ sơ'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
