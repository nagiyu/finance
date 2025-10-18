'use client';

import { useEffect, useState } from 'react';

import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import type {
  CheckPermissionRequestType,
  CheckPermissionResponseType,
} from '@/app/api/auth/check-permission/route';

type AuthProps = {
    userContent?: React.ReactNode;
    adminContent?: React.ReactNode;
    feature?: Feature;
    userLevel?: PermissionLevel;
    adminLevel?: PermissionLevel;
}

/**
 * 認証コンポーネント（後方互換性のため維持）
 * 
 * 新しいコードでは FeatureGuard コンポーネントの使用を推奨
 * このコンポーネントは既存のコードとの互換性のために残されています
 */
export default function Auth({
    userContent = null,
    adminContent = null,
    feature = Feature.STOCK_CHART,
    userLevel = PermissionLevel.VIEW,
    adminLevel = PermissionLevel.ADMIN
}: AuthProps) {
    const [isUser, setIsUser] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            }
        };

        // Initial check
        checkAuth();

        // Periodic check every 10 seconds to detect auth expiry
        const interval = setInterval(() => {
            checkAuth();
        }, 10000);

        return () => clearInterval(interval);
    }, [feature, userLevel, adminLevel]);

    if (loading) {
        return <div>読み込み中...</div>;
    }

    if (isAdmin && adminContent) {
        return <>{adminContent}</>;
    }

    if (isUser && userContent) {
        return <>{userContent}</>;
    }

    return (
        <div>サインインしてください。</div>
    );
}
