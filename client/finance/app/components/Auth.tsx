'use client';

import { useEffect, useState } from 'react';

import AuthAPIUtil from '@/app/utils/AuthAPIUtil';

type AuthProps = {
    userContent?: React.ReactNode;
    adminContent?: React.ReactNode;
}

export default function Auth({
    userContent = null,
    adminContent = null
}: AuthProps) {
    const [isUser, setIsUser] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        (async () => {
            setIsUser(await AuthAPIUtil.isAuthorized('user'));
            setIsAdmin(await AuthAPIUtil.isAuthorized('admin'));
        })();
    }, []);

    if (isAdmin && adminContent) {
        return (adminContent);
    }

    if (isUser && userContent) {
        return (userContent);
    }

    return (
        <div>サインインしてください。</div>
    );
}
