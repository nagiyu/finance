import type { Metadata } from 'next';
import './globals.css';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import CommonLayout from '@client-common/components/layout/CommonLayout';
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

import { FinanceFeature } from '@finance/consts/FinanceConst';

import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

export const metadata: Metadata = {
  title: 'Finance',
  description: 'Finance Application',
};

const authorizationService = new FinanceAuthorizationService();

const getMenuItems = async (): Promise<MenuItemData[]> => {
  const menuItems: MenuItemData[] = [];

  // ユーザー向けメニュー
  // Homeは株価チャート機能のVIEW権限で判定
  if (await authorizationService.authorize(FinanceFeature.STOCK_CHART, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Home', url: '/' });
  }

  // My Tickerメニュー
  if (await authorizationService.authorize(FinanceFeature.MY_TICKER, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'My Ticker', url: '/myticker' });
  }

  // Finance Notificationメニュー
  if (await authorizationService.authorize(FinanceFeature.FINANCE_NOTIFICATION, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Finance Notification', url: '/finance-notification' });
  }

  // 管理者向けメニュー
  if (await authorizationService.authorize(FinanceFeature.EXCHANGE, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Exchange', url: '/exchanges' });
  }

  if (await authorizationService.authorize(FinanceFeature.TICKER, PermissionLevel.VIEW)) {
    menuItems.push({ title: 'Ticker', url: '/tickers' });
  }

  // 認可設定メニュー
  if (await authorizationService.authorize(FinanceFeature.PERMISSION_ADMIN, PermissionLevel.VIEW)) {
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
