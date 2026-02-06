'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    Users as UsersIcon,
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
import { trpc } from '@/lib/trpc/client';
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

const userSchema = z.object({
    name: z.string().trim().min(1, 'Tên không được trống').max(200),
    email: z.string().email('Email không hợp lệ'),
    phoneNumber: z.string().trim().min(10, 'Số điện thoại không hợp lệ'),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .optional()
        .or(z.literal('')),
    roleId: z.string().min(1, 'Vui lòng chọn vai trò'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    avatar: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function AdminUsersPage() {
    const utils = trpc.useUtils();

    // Data Fetching
    const { data: usersData, isLoading } = trpc.user.list.useQuery({
        page: 1,
        limit: 100,
    });

    const { data: rolesData } = trpc.role.list.useQuery({
        page: 1,
        limit: 100,
    });

    const users = usersData?.data || [];
    const roles = rolesData?.data || [];

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            phoneNumber: '',
            password: '',
            roleId: '',
            status: 'ACTIVE',
            avatar: '',
        },
    });

    // Mutations
    const createMutation = trpc.user.create.useMutation({
        onSuccess: () => {
            toast.success('Đã tạo người dùng mới');
            utils.user.list.invalidate();
            setOpen(false);
            form.reset();
        },
        onError: (err) => {
            toast.error(`Lỗi: ${err.message}`);
        },
    });

    const updateMutation = trpc.user.update.useMutation({
        onSuccess: () => {
            toast.success('Đã cập nhật người dùng');
            utils.user.list.invalidate();
            setOpen(false);
            setEditing(null);
            form.reset();
        },
        onError: (err) => {
            toast.error(`Lỗi: ${err.message}`);
        },
    });

    const deleteMutation = trpc.user.delete.useMutation({
        onSuccess: () => {
            toast.success('Đã xóa người dùng');
            utils.user.list.invalidate();
            setDeleteId(null);
        },
        onError: (err) => {
            toast.error(`Lỗi: ${err.message}`);
        },
    });

    // Handlers
    const openCreate = () => {
        setEditing(null);
        form.reset({
            name: '',
            email: '',
            phoneNumber: '',
            password: '',
            roleId: roles[0]?.id ?? '',
            status: 'ACTIVE',
            avatar: '',
        });
        setOpen(true);
    };

    const openEdit = (user: any) => {
        setEditing(user);
        form.reset({
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            password: '', // Don't pre-fill password for security
            roleId: user.roleId || '',
            status: user.status || 'ACTIVE',
            avatar: user.avatar || '',
        });
        setOpen(true);
    };

    const onSubmit = (values: UserFormValues) => {
        if (editing) {
            // For updates, remove password if empty
            const updateData: any = { ...values };
            if (!updateData.password) {
                delete updateData.password;
            }
            updateMutation.mutate({
                params: { userId: editing.id },
                body: updateData,
            });
        } else {
            createMutation.mutate({
                ...values,
                password: values.password || 'defaultpassword123',
            });
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ userId: deleteId });
        }
    };

    // Filtering Logic
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchName =
                (user.name ?? '')
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (user.email ?? '')
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchRole =
                filterRole === 'all' || user.roleId === filterRole;
            const matchStatus =
                filterStatus === 'all' || user.status === filterStatus;
            return matchName && matchRole && matchStatus;
        });
    }, [users, searchQuery, filterRole, filterStatus]);

    // Stats
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.status === 'ACTIVE').length;
        const inactive = total - active;
        return { total, active, inactive };
    }, [users]);

    const getRoleName = (roleId: string) => {
        const role = roles.find((r) => r.id === roleId);
        return role?.name || 'N/A';
    };

    return (
        <div className="flex flex-col p-6 w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                        Quản lý người dùng
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Quản lý tài khoản, vai trò và trạng thái người dùng.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => utils.user.list.invalidate()}
                    >
                        Làm mới
                    </Button>
                    <Dialog
                        open={open}
                        onOpenChange={(v) => {
                            setOpen(v);
                            if (!v) setEditing(null);
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button
                                variant="hero"
                                onClick={openCreate}
                                className="gap-2 shadow-lg hover:shadow-primary/25"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm người dùng
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">
                                    {editing
                                        ? 'Chỉnh sửa người dùng'
                                        : 'Thêm người dùng mới'}
                                </DialogTitle>
                            </DialogHeader>

                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-4 pt-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tên *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nguyễn Văn A"
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
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Email *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="user@example.com"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Số điện thoại *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="0901234567"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {!editing && (
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Mật khẩu *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="roleId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Vai trò *
                                                    </FormLabel>
                                                    <Select
                                                        value={
                                                            field.value || ''
                                                        }
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn vai trò" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {roles.map(
                                                                (role) => (
                                                                    <SelectItem
                                                                        key={
                                                                            role.id
                                                                        }
                                                                        value={
                                                                            role.id
                                                                        }
                                                                    >
                                                                        {
                                                                            role.name
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

                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Trạng thái
                                                    </FormLabel>
                                                    <Select
                                                        value={
                                                            field.value ||
                                                            'ACTIVE'
                                                        }
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="ACTIVE">
                                                                Hoạt động
                                                            </SelectItem>
                                                            <SelectItem value="INACTIVE">
                                                                Không hoạt động
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
                                        name="avatar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Avatar URL
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://example.com/avatar.jpg"
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
                                            disabled={
                                                createMutation.isPending ||
                                                updateMutation.isPending
                                            }
                                        >
                                            {createMutation.isPending ||
                                            updateMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : editing ? (
                                                'Cập nhật'
                                            ) : (
                                                'Tạo mới'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs uppercase tracking-wide">
                            Tổng số
                        </CardDescription>
                        <CardTitle className="font-display text-3xl">
                            {stats.total}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Tổng số người dùng
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs uppercase tracking-wide">
                            Hoạt động
                        </CardDescription>
                        <CardTitle className="font-display text-3xl">
                            {stats.active}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Người dùng đang hoạt động
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs uppercase tracking-wide">
                            Không hoạt động
                        </CardDescription>
                        <CardTitle className="font-display text-3xl">
                            {stats.inactive}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Tài khoản bị khóa
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full sm:w-45">
                        <SelectValue placeholder="Lọc vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-45">
                        <SelectValue placeholder="Lọc trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">
                            Không hoạt động
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <UsersIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="font-semibold text-lg">
                                Không tìm thấy người dùng
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery ||
                                filterRole !== 'all' ||
                                filterStatus !== 'all'
                                    ? 'Thử thay đổi bộ lọc tìm kiếm'
                                    : 'Chưa có người dùng nào'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-sm">
                                            Tên
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm">
                                            Email
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm">
                                            Số điện thoại
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm">
                                            Vai trò
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm">
                                            Trạng thái
                                        </th>
                                        <th className="text-right p-4 font-semibold text-sm">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="font-medium">
                                                    {user.name}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {user.email}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {user.phoneNumber}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline">
                                                    {getRoleName(user.roleId)}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        user.status === 'ACTIVE'
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {user.status === 'ACTIVE'
                                                        ? 'Hoạt động'
                                                        : 'Không hoạt động'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            openEdit(user)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() =>
                                                            handleDelete(
                                                                user.id,
                                                            )
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa người dùng
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa người dùng này? Hành động này
                            không thể hoàn tác.
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
