export const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '0 đ';

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

export const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date));
};
