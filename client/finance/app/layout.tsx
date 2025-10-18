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

  // ユーザー向けメニュー（MY_TICKERのVIEW権限があれば認証済みユーザー）
  if (await AuthorizationService.authorize(Feature.MY_TICKER, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Home', url: '/' });
    menuItems.push({ title: 'My Ticker', url: '/myticker' });
  }

  // Finance Notificationメニュー
  if (await AuthorizationService.authorize(Feature.FINANCE_NOTIFICATION, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Finance Notification', url: '/finance-notification' });
  }

  // 管理者向けメニュー
  if (await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.ADMIN)) {
    menuItems.push({ title: 'Exchange', url: '/exchanges' });
  }

  if (await AuthorizationService.authorize(Feature.TICKER, PermissionLevel.ADMIN)) {
    menuItems.push({ title: 'Ticker', url: '/tickers' });
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
