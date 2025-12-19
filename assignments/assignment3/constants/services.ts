interface Service {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
    category: string;
  rating: number;
  status: string;
  distance: string;
  image: any;
  about: string;
  hours: {
    weekday: string;
    weekend: string;
  };
  contact: string;
  location: string;
  isFavorite: boolean;
}


const servicesData: Service[] = [
  {
    id: '1',
    name: 'Cafeteria',
    icon: 'local-cafe',
    color: '#3b82f6',
    description: 'Order your meals online.',
    category: 'Food & Beverage',
    rating: 4.5,
    status: 'Open',
    distance: '200m',
    image: '../assets/images/cafeteria.jpg',
    about: 'The campus cafeteria offers a variety of meals and beverages for students and staff. Enjoy a cozy atmosphere and delicious food at affordable prices.',
    hours: {
      weekday: '8:00 AM - 8:00 PM',
      weekend: '9:00 AM - 5:00 PM',
    },
    contact: '+1 (555) 123-4567',
    location: '123 Campus Drive, University Town',
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Sports Complex',
    icon: 'sports-cricket',
    color: '#de7973',
    description: 'Book courts and facilities.',
    category: 'Recreation',
    rating: 4.8,
    status: 'Open',
    distance: '500m',
    image: '../assets/images/sports_complex.jpg',
    about: 'The sports complex features state-of-the-art facilities for various sports including basketball, tennis, and swimming. Members can book courts and participate in fitness classes.',
    hours: {
      weekday: '6:00 AM - 10:00 PM',
      weekend: '8:00 AM - 8:00 PM',
    },
    contact: '+1 (555) 987-6543',
    location: '456 Athletic Ave, University Town',
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Student Affairs ',
    icon: 'accessibility',
    color: '#10b981',
    description: 'Get support and counseling.',
    category: 'Support Services',
    rating: 4.2,
    status: 'Closed',
    distance: '300m',
    image: '../assets/images/student_affairs.jpg',
    about: 'The Student Affairs office provides support services including counseling, academic advising, and career services to help students succeed during their time at the university.',
    hours: {
      weekday: '9:00 AM - 5:00 PM',
      weekend: 'Closed',
    },
    contact: '+1 (555) 555-1212',
    location: '789 Support St, University Town',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Transport Office',
    icon: 'emoji-transportation',
    color: '#8b5cf6',
    description: 'Manage your campus rides.',
    category: 'Transportation',
    rating: 4.0,
    status: 'Open',
    distance: '150m',
    image: '../assets/images/transport_office.jpg',
    about: 'The Transport Office coordinates campus shuttle services and parking permits. Students can manage their rides and access transportation resources here.',
    hours: {
      weekday: '7:00 AM - 7:00 PM',
      weekend: '9:00 AM - 3:00 PM',
    },
    contact: '+1 (555) 222-3333',
    location: '321 Transit Rd, University Town',
    isFavorite: true,
  },
  {
    id: '5',
    name: 'Hostel Management ',
    icon: 'other-houses',
    color: '#de7973',
    description: 'Room allocation and services.',
    category: 'Accommodation',
    rating: 4.3,
    status: 'Open',
    distance: '400m',
    image: '../assets/images/hostel_management.jpg',
    about: 'The Hostel Management office oversees student housing, including room allocations, maintenance requests, and residential life programs to ensure a comfortable living environment.',
    hours: {
      weekday: '9:00 AM - 6:00 PM',
      weekend: '10:00 AM - 4:00 PM',
    },
    contact: '+1 (555) 444-5555',
    location: '654 Dormitory Ln, University Town',
    isFavorite: false,
  },
];
export { servicesData, Service };
