import type { Metadata } from 'next';
import './globals.css';

import CommonLayout from '@client-common/components/layout/CommonLayout';
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { FinanceFeature } from '@finance/consts/FinanceConst';

export const metadata: Metadata = {
  title: 'Finance',
  description: 'Finance Application',
};

const getMenuItems = async (): Promise<MenuItemData[]> => {
  const menuItems: MenuItemData[] = [];

  // ユーザー向けメニュー
  // Homeは株価チャート機能のVIEW権限で判定
  if (await AuthorizationService.authorize(FinanceFeature.STOCK_CHART, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Home', url: '/' });
  }

  // My Tickerメニュー
  if (await AuthorizationService.authorize(FinanceFeature.MY_TICKER, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'My Ticker', url: '/myticker' });
  }

  // Finance Notificationメニュー
  if (await AuthorizationService.authorize(FinanceFeature.FINANCE_NOTIFICATION, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Finance Notification', url: '/finance-notification' });
  }

  // 管理者向けメニュー
  if (await AuthorizationService.authorize(FinanceFeature.EXCHANGE, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Exchange', url: '/exchanges' });
  }

  if (await AuthorizationService.authorize(FinanceFeature.TICKER, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Ticker', url: '/tickers' });
  }

  // 認可設定メニュー
  if (await AuthorizationService.authorize(FinanceFeature.PERMISSION_ADMIN, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Permission Admin', url: '/permission-admin' });
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
      enableAdSense={true}
    >
      {children}
    </CommonLayout>
  );
}
