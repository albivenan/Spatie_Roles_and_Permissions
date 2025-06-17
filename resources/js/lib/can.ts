import { usePage } from "@inertiajs/react";

type AuthUser = {
    id: number;
    name: string;
    email: string;
    permissions: string[];
};

type AuthProps = {
    user: AuthUser | null;
};

type PageProps = {
    auth: AuthProps;
    [key: string]: any;
};

export function can(permission: string): boolean {
    const { props } = usePage<PageProps>();
    return props.auth.user?.permissions?.includes(permission) ?? false;
}

export function usePermissions(): string[] {
    const { props } = usePage<PageProps>();
    return props.auth.user?.permissions ?? [];
}