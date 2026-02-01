'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import { trpc } from './client';
import superjson from 'superjson';

export default function TRPCProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() => {
        let isRefreshing = false;
        let refreshSubscribers: ((token: string) => void)[] = [];

        const onRefreshed = (token: string) => {
            refreshSubscribers.forEach((callback) => callback(token));
            refreshSubscribers = [];
        };

        return trpc.createClient({
            links: [
                httpBatchLink({
                    transformer: superjson,
                    url:
                        process.env.NEXT_PUBLIC_API_URL ||
                        'http://localhost:3052/v1/api/trpc',
                    // Custom fetch to handle 401 and refresh token
                    async fetch(url, options) {
                        const response = await fetch(url, options);

                        if (response.status === 401) {
                            const refreshToken =
                                localStorage.getItem('refreshToken');
                            if (!refreshToken) {
                                return response;
                            }

                            if (isRefreshing) {
                                return new Promise((resolve) => {
                                    refreshSubscribers.push(
                                        (newToken: string) => {
                                            const newHeaders = new Headers(
                                                options?.headers,
                                            );
                                            newHeaders.set(
                                                'authorization',
                                                `Bearer ${newToken}`,
                                            );
                                            resolve(
                                                fetch(url, {
                                                    ...options,
                                                    headers: newHeaders,
                                                }),
                                            );
                                        },
                                    );
                                });
                            }

                            isRefreshing = true;

                            try {
                                console.log(
                                    'DEBUG: Attempting refresh token...',
                                );
                                const refreshResponse = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3052/v1/api/trpc'}/auth.refreshToken`,
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            json: { refreshToken },
                                        }),
                                    },
                                );
                                console.log(
                                    'DEBUG: Refresh status:',
                                    refreshResponse.status,
                                );

                                if (refreshResponse.ok) {
                                    const data = await refreshResponse.json();
                                    console.log(
                                        'DEBUG: Refresh response data:',
                                        data,
                                    );
                                    const newTokens = data?.result?.data?.json; // Assuming superjson structure matches

                                    if (
                                        newTokens?.accessToken &&
                                        newTokens?.refreshToken
                                    ) {
                                        console.log(
                                            'DEBUG: Refresh success, broadcasting new token',
                                        );
                                        localStorage.setItem(
                                            'accessToken',
                                            newTokens.accessToken,
                                        );
                                        localStorage.setItem(
                                            'refreshToken',
                                            newTokens.refreshToken,
                                        );

                                        isRefreshing = false;
                                        onRefreshed(newTokens.accessToken);

                                        // Retry original request with new token
                                        const newHeaders = new Headers(
                                            options?.headers,
                                        );
                                        newHeaders.set(
                                            'authorization',
                                            `Bearer ${newTokens.accessToken}`,
                                        );

                                        return fetch(url, {
                                            ...options,
                                            headers: newHeaders,
                                        });
                                    } else {
                                        console.error(
                                            'DEBUG: Valid response but missing tokens in data',
                                        );
                                        throw new Error(
                                            'Invalid refresh response',
                                        );
                                    }
                                } else {
                                    console.error(
                                        'DEBUG: Refresh failed with status',
                                        refreshResponse.status,
                                    );
                                    throw new Error('Refresh failed');
                                }
                            } catch (error) {
                                console.error(
                                    'DEBUG: Refresh flow error',
                                    error,
                                );
                                isRefreshing = false;
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                window.location.href = '/auth/login';
                                refreshSubscribers = []; // Clear queue
                                return response;
                            }
                        }

                        return response;
                    },
                    // You can pass any HTTP headers you wish here
                    async headers() {
                        const token =
                            typeof window !== 'undefined'
                                ? localStorage.getItem('accessToken')
                                : null;
                        return {
                            authorization: token ? `Bearer ${token}` : '',
                        };
                    },
                }),
            ],
        });
    });

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </trpc.Provider>
    );
}
