export const RoleName = {
    Admin: 'ADMIN',
    Client: 'CLIENT',
    Seller: 'SELLER',
    Guest: 'GUEST',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];
