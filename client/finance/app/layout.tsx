import type { Metadata } from 'next';
import './globals.css';

import CommonLayout from '@client-common/components/layout/CommonLayout';
import { MenuItemData } from '@client-common/components/navigations/Menus/LinkMenu';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export const metadata: Metadata = {
  title: 'Finance',
  description: 'Finance Application',
};

const getMenuItems = async (): Promise<MenuItemData[]> => {
  const menuItems: MenuItemData[] = [];

  if (await FinanceAuthorizer.isUser()) {
    menuItems.push(
      { title: 'Home', url: '/' },
      { title: 'My Ticker', url: '/myticker' },
      { title: 'Finance Notification', url: '/finance-notification' },
    );
  }

  if (await FinanceAuthorizer.isAdmin()) {
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
