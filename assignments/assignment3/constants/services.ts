interface Service {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const servicesData: Service[] = [
  {
    id: '1',
    name: 'Cafeteria',
    icon: 'local-cafe',
    color: '#3b82f6',
    description: 'Order your meals online.',
  },
  {
    id: '2',
    name: 'Sports Complex',
    icon: 'sports-cricket',
    color: '#de7973',
    description: 'Book courts and facilities.',
  },
  {
    id: '3',
    name: 'Student Affairs ',
    icon: 'accessibility',
    color: '#10b981',
    description: 'Get support and counseling.',
  },
  {
    id: '4',
    name: 'Transport Office',
    icon: 'emoji-transportation',
    color: '#8b5cf6',
    description: 'Manage your campus rides.',
  },
  {
    id: '5',
    name: 'Hostel Management ',
    icon: 'other-houses',
    color: '#de7973',
    description: 'Room allocation and services.',
  },
];
export { servicesData, Service };
