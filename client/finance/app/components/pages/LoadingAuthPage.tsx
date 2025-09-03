'use client';

import { useEffect, useState } from 'react';

import LoadingContent from '@client-common/components/content/LoadingContent';
import LoadingPage from '@client-common/pages/LoadingPage';

import AuthAPIUtil from '@/app/utils/AuthAPIUtil';

type LoadingAuthPageProps = {
    userContent?: (
        loading: boolean,
        runWithLoading: <T>(func: () => Promise<T>) => Promise<T>
    ) => React.ReactNode;
    adminContent?: (
        loading: boolean,
        runWithLoading: <T>(func: () => Promise<T>) => Promise<T>
    ) => React.ReactNode;
}

export default function LoadingAuthPage({
    userContent,
    adminContent
}: LoadingAuthPageProps) {
    const [initLoading, setInitLoading] = useState(true);
    const [isUser, setIsUser] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        (async () => {
            setIsUser(await AuthAPIUtil.isAuthorized('user'));
            setIsAdmin(await AuthAPIUtil.isAuthorized('admin'));
            setInitLoading(false);
        })();
    }, []);

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
