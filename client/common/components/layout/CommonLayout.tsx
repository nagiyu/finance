import React from 'react';

import { Geist, Geist_Mono } from 'next/font/google';

import AccountContent from '@client-common/components/content/AccountContent';
import BasicAppBar from '@client-common/components/surfaces/AppBars/BasicAppBar';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import LinkMenu, { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';
import NotificationSettingButton from '@client-common/components/inputs/buttons/NotificationSettingButton';
import SessionUtil from '@client-common/utils/SessionUtil.server';
import SignInButton from '@client-common/components/inputs/Buttons/SignInButton';
import SignoutButton from '@client-common/components/inputs/Buttons/SignOutButton';

interface CommonLayoutProps {
    title: string;
    menuItems?: MenuItemData[];

    // Authentication
    enableAuthentication?: boolean;

    // Notification
    enableNotification?: boolean;

    children: React.ReactNode;
}

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const isAuthenticated = async () => {
    return await SessionUtil.hasSession();
}

export default async function CommonLayout({
    title,
    menuItems = [],
    enableAuthentication = false,
    enableNotification = false,
    children
}: CommonLayoutProps) {
    const authenticatedContent = async (): Promise<React.ReactNode> => {
        if (!(await isAuthenticated())) {
            return <SignInButton />;
        } else {
            return <SignoutButton />;
        }
    }

    const menuContent = (): React.ReactNode => {
        if (menuItems.length === 0) {
            return null;
        }

        return <LinkMenu menuItems={menuItems} />;
    }

    return (
        <html lang='ja'>
            <head>
                <link rel='manifest' href='/manifest.webmanifest' />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <BasicAppBar
                    left={
                        <DirectionStack>
                            {enableAuthentication && <AccountContent isAuthenticated={await isAuthenticated()} />}
                        </DirectionStack>
                    }
                    center={
                        <div>{title}</div>
                    }
                    right={
                        <DirectionStack>
                            {enableAuthentication && await authenticatedContent()}
                            {enableNotification && <NotificationSettingButton />}
                            {menuContent()}
                        </DirectionStack>
                    }
                />
                {children}
            </body>
        </html>
    )
}
