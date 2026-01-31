export interface RouteItem {
  path: string;
  name: string;
  icon?: string;
  component?: React.ComponentType;
}

export const routes: RouteItem[] = [
  {
    path: '/home',
    name: 'Trang chủ',
    icon: 'HomeOutlined',
  },
  {
    path: '/settings',
    name: 'Cài đặt',
    icon: 'SettingOutlined',
  },
];