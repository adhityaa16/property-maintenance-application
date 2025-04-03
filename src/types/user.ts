export type UserRole = 'owner' | 'tenant' | 'service_provider';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface Owner extends User {
    role: 'owner';
    properties: string[];
}

export interface Tenant extends User {
    role: 'tenant';
    propertyId: string;
    leaseStart: string;
    leaseEnd: string;
}

export interface ServiceProvider extends User {
    role: 'service_provider';
    services: string[];
    rating: number;
    completedJobs: number;
} 