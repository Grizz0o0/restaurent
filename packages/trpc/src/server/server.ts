import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import {
    LoginBodySchema,
    LoginResSchema,
    RefreshTokenBodySchema,
    RefreshTokenResSchema,
    RegisterBodySchema,
    RegisterResSchema,
    SendOTPBodySchema,
    LogoutBodySchema,
    BanUserBodySchema,
    BanUserBodyType,
    UnbanUserBodySchema,
    UnbanUserBodyType,
    ForceLogoutBodySchema,
    ForceLogoutBodyType,
    GetPermissionsQuerySchema,
    GetPermissionsResSchema,
    GetPermissionParamsSchema,
    GetPermissionDetailResSchema,
    CreatePermissionBodySchema,
    UpdatePermissionBodySchema,
    GetRolesQuerySchema,
    GetRolesResSchema,
    GetRoleDetailParamsSchema,
    GetRoleDetailResSchema,
    CreateRoleBodySchema,
    UpdateRoleBodySchema,
    GetUsersQuerySchema,
    GetUsersResSchema,
    GetUserDetailParamsSchema,
    UserDetailResSchema,
    CreateUserBodySchema,
    UpdateUserBodySchema,
    ProfileDetailResSchema,
    UpdateProfileBodySchema,
    ForgotPasswordBodySchema,
    GetAuthorizationUrlResSchema,
    GoogleCallbackBodySchema,
    GetSessionsResSchema,
    RevokeSessionBodySchema,
    RevokeAllSessionsResSchema,
    ChangePasswordBodySchema,
    TwoFactorSetupResSchema,
    DisableTwoFactorAuthBodySchema,
    GuestLoginBodySchema,
    GetDishesResSchema,
    DishDetailResSchema,
    GetDishesQuerySchema,
    CreateDishBodySchema,
    GetCategoriesQuerySchema,
    GetCategoriesResSchema,
    CategoryDetailResSchema,
    CreateCategoryBodySchema,
    GetTablesResSchema,
    GetTablesQuerySchema,
    RestaurantTableSchema,
    CreateTableBodySchema,
    OrderSchema,
    CreateOrderBodySchema,
    GetOrdersQuerySchema,
    GetOrdersResSchema,
    UpdateTableBodySchema,
    UpdateCategoryBodySchema,
    UpdateDishBodySchema,
} from '@repo/schema';
import superjson from 'superjson';
const t = initTRPC.create({
    transformer: superjson,
});
const publicProcedure = t.procedure;

const appRouter = t.router({
    auth: t.router({
        register: publicProcedure
            .input(RegisterBodySchema)
            .output(RegisterResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        login: publicProcedure
            .input(LoginBodySchema)
            .output(LoginResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        refreshToken: publicProcedure
            .input(RefreshTokenBodySchema)
            .output(RefreshTokenResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        sendOTP: publicProcedure
            .input(SendOTPBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        logout: publicProcedure
            .input(LogoutBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        forgotPassword: publicProcedure
            .input(ForgotPasswordBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        googleUrl: publicProcedure
            .output(GetAuthorizationUrlResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        googleCallback: publicProcedure
            .input(GoogleCallbackBodySchema)
            .output(LoginResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        getActiveSessions: publicProcedure
            .output(GetSessionsResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        revokeSession: publicProcedure
            .input(RevokeSessionBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        revokeAllSessions: publicProcedure
            .output(RevokeAllSessionsResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        changePassword: publicProcedure
            .input(ChangePasswordBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        guestLogin: publicProcedure
            .input(GuestLoginBodySchema)
            .output(LoginResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        setup2FA: publicProcedure
            .output(TwoFactorSetupResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        disable2FA: publicProcedure
            .input(DisableTwoFactorAuthBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    admin: t.router({
        banUser: publicProcedure
            .input(BanUserBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        unbanUser: publicProcedure
            .input(UnbanUserBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        forceLogout: publicProcedure
            .input(ForceLogoutBodySchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    permission: t.router({
        list: publicProcedure
            .input(GetPermissionsQuerySchema)
            .output(GetPermissionsResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        detail: publicProcedure
            .input(GetPermissionParamsSchema)
            .output(GetPermissionDetailResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        create: publicProcedure
            .input(CreatePermissionBodySchema)
            .output(GetPermissionDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        update: publicProcedure
            .input(
                z.object({
                    params: GetPermissionParamsSchema,
                    body: UpdatePermissionBodySchema,
                }),
            )
            .output(GetPermissionDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        delete: publicProcedure
            .input(GetPermissionParamsSchema)
            .output(z.object({ message: z.string() }))
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    role: t.router({
        list: publicProcedure
            .input(GetRolesQuerySchema)
            .output(GetRolesResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        detail: publicProcedure
            .input(GetRoleDetailParamsSchema)
            .output(GetRoleDetailResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        create: publicProcedure
            .input(CreateRoleBodySchema)
            .output(GetRoleDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        update: publicProcedure
            .input(
                z.object({
                    params: GetRoleDetailParamsSchema,
                    body: UpdateRoleBodySchema,
                }),
            )
            .output(GetRoleDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        delete: publicProcedure
            .input(GetRoleDetailParamsSchema)
            .output(z.object({ message: z.string() }))
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    user: t.router({
        list: publicProcedure
            .input(GetUsersQuerySchema)
            .output(GetUsersResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        detail: publicProcedure
            .input(GetUserDetailParamsSchema)
            .output(UserDetailResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        create: publicProcedure
            .input(CreateUserBodySchema)
            .output(UserDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        update: publicProcedure
            .input(
                z.object({
                    params: GetUserDetailParamsSchema,
                    body: UpdateUserBodySchema,
                }),
            )
            .output(UserDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        delete: publicProcedure
            .input(GetUserDetailParamsSchema)
            .output(z.object({ message: z.string() }))
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    profile: t.router({
        getProfile: publicProcedure
            .output(ProfileDetailResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        updateProfile: publicProcedure
            .input(UpdateProfileBodySchema)
            .output(ProfileDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    dish: t.router({
        list: publicProcedure
            .input(GetDishesQuerySchema)
            .output(GetDishesResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        detail: publicProcedure
            .input(z.object({ id: z.string() }))
            .output(DishDetailResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        create: publicProcedure
            .input(CreateDishBodySchema)
            .output(DishDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        update: publicProcedure
            .input(
                z.object({
                    id: z.string(),
                    data: UpdateDishBodySchema,
                }),
            )
            .output(DishDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        delete: publicProcedure
            .input(z.object({ id: z.string() }))
            .output(z.any())
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    category: t.router({
        list: publicProcedure
            .input(GetCategoriesQuerySchema)
            .output(GetCategoriesResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        detail: publicProcedure
            .input(z.object({ id: z.string() }))
            .output(CategoryDetailResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        create: publicProcedure
            .input(CreateCategoryBodySchema)
            .output(CategoryDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        update: publicProcedure
            .input(
                z.object({
                    id: z.string(),
                    data: UpdateCategoryBodySchema,
                }),
            )
            .output(CategoryDetailResSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        delete: publicProcedure
            .input(z.object({ id: z.string() }))
            .output(z.any())
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    table: t.router({
        list: publicProcedure
            .input(GetTablesQuerySchema)
            .output(GetTablesResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        detail: publicProcedure
            .input(z.object({ id: z.string() }))
            .output(RestaurantTableSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        create: publicProcedure
            .input(CreateTableBodySchema)
            .output(RestaurantTableSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        update: publicProcedure
            .input(
                z.object({
                    id: z.string(),
                    data: UpdateTableBodySchema,
                }),
            )
            .output(RestaurantTableSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        delete: publicProcedure
            .input(z.object({ id: z.string() }))
            .output(z.any())
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
    order: t.router({
        create: publicProcedure
            .input(CreateOrderBodySchema)
            .output(OrderSchema)
            .mutation(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
        list: publicProcedure
            .input(GetOrdersQuerySchema)
            .output(GetOrdersResSchema)
            .query(async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any),
    }),
});
export type AppRouter = typeof appRouter;
