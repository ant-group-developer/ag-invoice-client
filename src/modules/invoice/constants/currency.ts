export interface CurrencyOption {
    value: string;
    label: string;
    symbol: string;
    locale: string;
    name: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
    {
        value: 'USD',
        label: 'USD ($)',
        symbol: '$',
        locale: 'en-US',
        name: 'Đô la Mỹ',
    },
    {
        value: 'GBP',
        label: 'GBP (£)',
        symbol: '£',
        locale: 'en-GB',
        name: 'Bảng Anh',
    },
    {
        value: 'EUR',
        label: 'EUR (€)',
        symbol: '€',
        locale: 'de-DE',
        name: 'Euro',
    },
    {
        value: 'INR',
        label: 'INR (₹)',
        symbol: '₹',
        locale: 'en-IN',
        name: 'Rupee',
    },
    {
        value: 'VND',
        label: 'VND (₫)',
        symbol: '₫',
        locale: 'vi-VN',
        name: 'Việt Nam Đồng',
    },
    {
        value: 'CNY',
        label: 'CNY (¥)',
        symbol: '¥',
        locale: 'zh-CN',
        name: 'Nhân dân tệ',
    },
];

export const getCurrencyOption = (
    currencyCode?: string
): CurrencyOption => {
    return (
        CURRENCY_OPTIONS.find((item) => item.value === currencyCode) ||
        CURRENCY_OPTIONS[0]
    );
};
