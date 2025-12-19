interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;

}


  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Digital ID',
      icon: 'badge-account-horizontal',
      color: '#6366f1',

    },
    {
      id: '2',
      label: 'Grades',
      icon: 'chart-line',
      color: '#10b981',

    },
    {
      id: '3',
      label: 'QR Code',
      icon: 'qrcode',
      color: '#f59e0b',

    },
    {
      id: '4',
      label: 'Log Out',
      icon: 'logout',
      color: '#ef4444',

    },
  ];

export { quickActions };
