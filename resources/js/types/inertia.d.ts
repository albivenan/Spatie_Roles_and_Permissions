import { PageProps as InertiaPageProps } from '@inertiajs/core';

declare global {
    // Extend the Window interface to include global variables
    interface Window {
        // Add any global variables here if needed
    }

    // Extend the Inertia Page type
    interface PageProps extends InertiaPageProps {
        auth: {
            user: {
                id: number;
                name: string;
                email: string;
                permissions: string[];
            } | null;
        };
    }
}

// This is needed to make this file a module
export {};
