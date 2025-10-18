'use client';

import { useEffect, useState } from 'react';

import LoadingContent from '@client-common/components/content/LoadingContent';
import LoadingPage from '@client-common/pages/LoadingPage';

import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import type {
  CheckPermissionRequestType,
  CheckPermissionResponseType,
} from '@/app/api/auth/check-permission/route';

type LoadingAuthPageProps = {
    userContent?: (
        loading: boolean,
        runWithLoading: <T>(func: () => Promise<T>) => Promise<T>
    ) => React.ReactNode;
    adminContent?: (
        loading: boolean,
        runWithLoading: <T>(func: () => Promise<T>) => Promise<T>
    ) => React.ReactNode;
    feature?: Feature;
    userLevel?: PermissionLevel;
    adminLevel?: PermissionLevel;
}

/**
 * LoadingAuthPage（後方互換性のため維持）
 * 
 * 新しいコードでは FeatureGuard と LoadingContent の組み合わせを推奨
 * このコンポーネントは既存のコードとの互換性のために残されています
 */
export default function LoadingAuthPage({
    userContent,
    adminContent,
    feature = Feature.STOCK_CHART,
    userLevel = PermissionLevel.VIEW,
    adminLevel = PermissionLevel.ADMIN
}: LoadingAuthPageProps) {
    const [initLoading, setInitLoading] = useState(true);
    const [isUser, setIsUser] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check admin permission
                const adminRequest: CheckPermissionRequestType = { 
                    feature, 
                    level: adminLevel 
                };
                const adminResponse = await fetch('/api/auth/check-permission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(adminRequest)
                });

                if (adminResponse.ok) {
                    const adminResult: CheckPermissionResponseType = await adminResponse.json();
                    setIsAdmin(adminResult.hasPermission);
                } else {
                    setIsAdmin(false);
                }

                // Check user permission
                const userRequest: CheckPermissionRequestType = { 
                    feature, 
                    level: userLevel 
                };
                const userResponse = await fetch('/api/auth/check-permission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userRequest)
                });

                if (userResponse.ok) {
                    const userResult: CheckPermissionResponseType = await userResponse.json();
                    setIsUser(userResult.hasPermission);
                } else {
                    setIsUser(false);
                }
            } catch (error) {
                console.error('Error checking authorization:', error);
                setIsUser(false);
                setIsAdmin(false);
            } finally {
                setInitLoading(false);
            }
        };

        // Initial check
        checkAuth();

        // Periodic check every 10 seconds to detect auth expiry
        const interval = setInterval(async () => {
            try {
                const adminRequest: CheckPermissionRequestType = { 
                    feature, 
                    level: adminLevel 
                };
                const adminResponse = await fetch('/api/auth/check-permission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(adminRequest)
                });

                if (adminResponse.ok) {
                    const adminResult: CheckPermissionResponseType = await adminResponse.json();
                    setIsAdmin(adminResult.hasPermission);
                } else {
                    setIsAdmin(false);
                }

                const userRequest: CheckPermissionRequestType = { 
                    feature, 
                    level: userLevel 
                };
                const userResponse = await fetch('/api/auth/check-permission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userRequest)
                });

                if (userResponse.ok) {
                    const userResult: CheckPermissionResponseType = await userResponse.json();
                    setIsUser(userResult.hasPermission);
                } else {
                    setIsUser(false);
                }
            } catch (error) {
                console.error('Error checking authorization:', error);
                setIsUser(false);
                setIsAdmin(false);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [feature, userLevel, adminLevel]);

    const content = (
        loading: boolean,
        runWithLoading: <T>(func: () => Promise<T>) => Promise<T>
    ) => {
        if (isAdmin && adminContent) {
            return adminContent(loading, runWithLoading);
        }

        if (isUser && userContent) {
            return userContent(loading, runWithLoading);
        }

        return <div>サインインしてください。</div>;
    };

    if (initLoading) {
        return <LoadingPage />;
    }

    return (
        <LoadingContent>
            {(loading, runWithLoading) => (
                content(loading, runWithLoading)
            )}
        </LoadingContent>
    )
}
