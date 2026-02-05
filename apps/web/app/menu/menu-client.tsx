'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { formatCurrency } from '@/lib/utils/format';
import { DishDetailModal } from '@/components/menu/dish-detail-modal';
import { useDebounce } from '@/hooks/use-debounce';

export const MenuClient = () => {
    const [activeCategoryId, setActiveCategoryId] = useState<
        string | undefined
    >(undefined);
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Fetch Categories
    const { data: categoriesData, isLoading: isLoadingCategories } =
        trpc.category.list.useQuery({
            limit: 20, // Get enough categories
            page: 1,
        });

    // Fetch Dishes
    const {
        data: dishesData,
        isLoading: isLoadingDishes,
        isFetching,
    } = trpc.dish.list.useQuery(
        {
            categoryId:
                activeCategoryId === 'all' ? undefined : activeCategoryId,
            search: debouncedSearchQuery,
            limit: 50,
        },
        {
            keepPreviousData: true,
        } as any,
    ); // Type assertion if needed for keepPreviousData depending on query version

    const categories = categoriesData?.data || [];
    const dishes = dishesData?.data || [];

    const handleCategoryChange = (id: string) => {
        setActiveCategoryId(id === 'all' ? undefined : id);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-secondary/50 border-b border-border">
                <div className="container mx-auto px-4 py-16">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                        Thực Đơn
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Khám phá các loại bánh mì thơm ngon của chúng tôi
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm món ăn..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                            <Button
                                variant={
                                    activeCategoryId === undefined
                                        ? 'hero'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => handleCategoryChange('all')}
                                className="whitespace-nowrap"
                            >
                                Tất cả
                            </Button>
                            {isLoadingCategories
                                ? // Skeleton loader for categories
                                  Array.from({ length: 4 }).map((_, i) => (
                                      <div
                                          key={i}
                                          className="h-9 w-24 bg-muted animate-pulse rounded-md"
                                      />
                                  ))
                                : categories.map((category: any) => (
                                      <Button
                                          key={category.id}
                                          variant={
                                              activeCategoryId === category.id
                                                  ? 'hero'
                                                  : 'outline'
                                          }
                                          size="sm"
                                          onClick={() =>
                                              handleCategoryChange(category.id)
                                          }
                                          className="whitespace-nowrap"
                                      >
                                          {category.name}
                                      </Button>
                                  ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <main className="container mx-auto px-4 py-12">
                {isLoadingDishes && !dishes.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-100 bg-muted animate-pulse rounded-2xl"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dishes.map((item: any) => (
                            <div
                                key={item.id}
                                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-warm transition-all duration-300 flex flex-col"
                            >
                                <div className="relative aspect-square overflow-hidden bg-muted">
                                    {item.images?.[0] ? (
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name || 'Món ăn'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                                        {item.name}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4">
                                        <span className="text-lg font-bold text-primary">
                                            {formatCurrency(item.basePrice)}
                                        </span>
                                        <Button
                                            variant="warm"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedDishId(item.id);
                                            }}
                                        >
                                            Thêm
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoadingDishes && dishes.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            Không tìm thấy món ăn phù hợp
                        </p>
                    </div>
                )}
            </main>

            <DishDetailModal
                isOpen={!!selectedDishId}
                dishId={selectedDishId}
                onClose={() => setSelectedDishId(null)}
            />
        </div>
    );
};
