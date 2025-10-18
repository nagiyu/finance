import type { Metadata } from 'next';
import './globals.css';

import CommonLayout from '@client-common/components/layout/CommonLayout';
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

export const metadata: Metadata = {
  title: 'Finance',
  description: 'Finance Application',
};

const getMenuItems = async (): Promise<MenuItemData[]> => {
  const menuItems: MenuItemData[] = [];

  // ユーザー向けメニュー（VIEW権限があれば表示）
  if (await AuthorizationService.authorize(Feature.MY_TICKER, PermissionLevel.VIEW)) {
    menuItems.push(
      { title: 'Home', url: '/' },
      { title: 'My Ticker', url: '/myticker' },
      { title: 'Finance Notification', url: '/finance-notification' },
    );
  }

  // 管理者向けメニュー（ADMIN権限があれば表示）
  if (await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.ADMIN)) {
    menuItems.push(
      { title: 'Exchange', url: '/exchanges' },
      { title: 'Ticker', url: '/tickers' },
    );
  }

  return menuItems;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CommonLayout
      title='Finance'
      menuItems={await getMenuItems()}
      enableAuthentication={true}
      enableNotification={true}
    >
      {children}
    </CommonLayout>
  );
}
