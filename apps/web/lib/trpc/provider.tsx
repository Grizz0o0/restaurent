'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    transformer: superjson,
                    url: 'http://localhost:3000/trpc',
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
        }),
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
