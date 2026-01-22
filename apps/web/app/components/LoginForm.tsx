'use client';
import { useState } from 'react';
import { trpc } from '../../lib/trpc/client';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: (data) => {
            alert('Login success! Token: ' + data.accessToken);
            console.log('Refresh Token:', data.refreshToken);
        },
        onError: (error) => {
            alert('Login failed: ' + error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-sm mx-auto p-4 border rounded bg-white text-black"
        >
            <h2 className="text-xl font-bold">Login Test</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded"
            />
            <button
                type="submit"
                disabled={loginMutation.isPending}
                className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};
