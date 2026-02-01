import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

export const useAuth = () => {
    const router = useRouter();
    const utils = trpc.useUtils();

    // Query current user profile
    const {
        data: user,
        isLoading,
        refetch,
    } = trpc.profile.getProfile.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false,
    });

    // Login Mutation
    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: (data) => {
            // Store token
            if (data?.accessToken && data?.refreshToken) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            // Invalidate profile query to fetch user data immediately
            utils.profile.getProfile.invalidate();
            toast.success('Đăng nhập thành công');
            router.push('/');
        },
        onError: (error) => {
            if (error.message?.includes('Error.InvalidTOTPAndCode')) return;
            toast.error(error.message || 'Đăng nhập thất bại');
        },
    });

    // Register Mutation
    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: (data) => {
            // Depending on flow, auto-login or ask to login
            if (data?.accessToken && data?.refreshToken) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                utils.profile.getProfile.invalidate();
                toast.success('Đăng ký thành công');
                router.push('/');
            } else {
                toast.success('Đăng ký thành công. Vui lòng đăng nhập.');
                router.push('/auth/login');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Đăng ký thất bại');
        },
    });

    const sendOTPMutation = trpc.auth.sendOTP.useMutation({
        onSuccess: () => {
            toast.success('Mã OTP đã được gửi đến email của bạn');
        },
        onError: (error) => {
            toast.error(error.message || 'Gửi OTP thất bại');
        },
    });

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        utils.profile.getProfile.setData(undefined, null as any); // Clear cache
        toast.info('Đã đăng xuất');
        router.push('/auth/login');
    };

    return {
        user,
        isAuthenticated: !!user,
        isLoading:
            isLoading ||
            loginMutation.isPending ||
            registerMutation.isPending ||
            sendOTPMutation.isPending,
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        register: registerMutation.mutate,
        registerAsync: registerMutation.mutateAsync,
        sendOTP: sendOTPMutation.mutate,
        sendOTPAsync: sendOTPMutation.mutateAsync,
        logout,
    };
};
