'use client';

import React, { useEffect, useState } from 'react';

import AccountSettingDialog from '@client-common/components/feedback/dialog/AccountSettingDialog';
import AccountFetchService from '@client-common/services/auth/AccountFetchService.client';
import UserIconAvatar from '@client-common/components/data/avatar/UserIconAvatar';

interface AccountContentProps {
    isAuthenticated?: boolean;
}

export default function AccountContent({
    isAuthenticated = false,
}: AccountContentProps) {
    const [accountSettingDialogOpen, setAccountSettingDialogOpen] = useState(false);

    const accountFetchService = new AccountFetchService();

    useEffect(() => {
        (async () => {
            if (!isAuthenticated) {
                return;
            }

            try {
                // Check if user has account data - only open dialog for new users
                const accounts = await accountFetchService.get();

                if (accounts.length === 0) {
                    // New user - automatically open dialog for account setup
                    setAccountSettingDialogOpen(true);
                }
                // Existing users: dialog remains closed
            } catch {
                // If there's an error checking account data, assume new user
                setAccountSettingDialogOpen(true);
            }
        })();
    }, []);

    return (
        <>
            {isAuthenticated && <UserIconAvatar onClick={() => setAccountSettingDialogOpen(true)} />}
            <AccountSettingDialog
                open={accountSettingDialogOpen}
                onClose={() => setAccountSettingDialogOpen(false)}
            />
        </>
    )
}
