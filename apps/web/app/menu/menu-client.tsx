'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { toast } from 'sonner';

import banhMiThitNuong from '@/assets/banh-mi-thit-nuong.jpg';
import banhMiChaLua from '@/assets/banh-mi-cha-lua.jpg';
import banhMiXiuMai from '@/assets/banh-mi-xiu-mai.jpg';
import banhMiOpLa from '@/assets/banh-mi-op-la.jpg';

const menuItems = [
    {
        id: 1,
        name: 'Bánh Mì Thịt Nướng',
        description:
            'Thịt heo nướng than hoa thơm lừng, kèm rau sống tươi mát và nước sốt đặc biệt',
        price: 35000,
        image: banhMiThitNuong,
        category: 'classic',
        popular: true,
    },
    {
        id: 2,
        name: 'Bánh Mì Chả Lụa',
        description:
            'Chả lụa truyền thống dai mềm, kết hợp pate gan và bơ béo ngậy',
        price: 25000,
        image: banhMiChaLua,
        category: 'classic',
        popular: false,
    },
    {
        id: 3,
        name: 'Bánh Mì Xíu Mại',
        description:
            'Xíu mại thịt heo sốt cà chua đậm đà, ăn kèm dưa leo giòn tan',
        price: 30000,
        image: banhMiXiuMai,
        category: 'special',
        popular: true,
    },
    {
        id: 4,
        name: 'Bánh Mì Ốp La',
        description:
            'Trứng ốp la chín tới, lòng đào béo ngậy với chút tiêu đen và hành lá',
        price: 28000,
        image: banhMiOpLa,
        category: 'classic',
        popular: false,
    },
    {
        id: 5,
        name: 'Bánh Mì Bò Kho',
        description:
            'Bò kho hầm mềm với nước sốt đậm đà, thơm mùi ngũ vị hương',
        price: 40000,
        image: banhMiThitNuong,
        category: 'special',
        popular: true,
    },
    {
        id: 6,
        name: 'Bánh Mì Gà Xé',
        description:
            'Gà xé sợi mềm ngọt tự nhiên, trộn rau răm và hành phi giòn',
        price: 32000,
        image: banhMiChaLua,
        category: 'special',
        popular: false,
    },
    {
        id: 7,
        name: 'Bánh Mì Chay',
        description: 'Đậu hũ chiên giòn, nấm xào và các loại rau củ tươi ngon',
        price: 22000,
        image: banhMiXiuMai,
        category: 'vegetarian',
        popular: false,
    },
    {
        id: 8,
        name: 'Bánh Mì Pate Gan',
        description: 'Pate gan thơm béo, kết hợp chả lụa và dưa chua cắt sợi',
        price: 28000,
        image: banhMiOpLa,
        category: 'classic',
        popular: true,
    },
];

const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'classic', name: 'Cổ điển' },
    { id: 'special', name: 'Đặc biệt' },
    { id: 'vegetarian', name: 'Chay' },
];

export const MenuClient = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = menuItems.filter((item) => {
        const matchesCategory =
            activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
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
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={
                                        activeCategory === category.id
                                            ? 'hero'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setActiveCategory(category.id)
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-warm transition-all duration-300"
                        >
                            <div className="relative aspect-square overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    placeholder="blur"
                                />
                                {item.popular && (
                                    <span className="absolute top-3 left-3 bg-chili text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                                        Bán chạy
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                                    {item.name}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(item.price)}
                                    </span>
                                    <Button
                                        variant="warm"
                                        size="sm"
                                        onClick={() => {
                                            toast.success(
                                                `Đã thêm ${item.name} vào giỏ hàng`,
                                            );
                                        }}
                                    >
                                        Thêm vào giỏ
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            Không tìm thấy món ăn phù hợp
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};
