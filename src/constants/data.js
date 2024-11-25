import Camera from '../../asset/svg/Camera.svg';
import Video from '../../asset/svg/Video.svg';
import Receipt from '../../asset/svg/Receipt.svg';
import Payment from '../../asset/svg/Payment.svg';

export const Products = [
  {id: '1', name: 'Camera', icon: Camera, screen: 'Choose Camera'},
  {id: '2', name: 'Videos', icon: Video},
  {id: '3', name: 'Payment', icon: Payment, screen: 'Payment'},
  {
    id: '4',
    name: 'Transaction History',
    icon: Receipt,
    screen: 'Payment',
    params: 'Transaction History',
  },
];

export const PaymentOptions = [
  {
    id: 1,
    name: 'Pricing Plans',
  },
  {
    id: 2,
    name: 'Transaction History',
  },
];

export const PaymentPlans = [
  {
    id: 1,
    name: 'Free Plan',
    is_free: true,
    price: '$0.00',
    features: [
      {
        id: 11,
        name: 'Camera View',
      },
      {
        id: 12,
        name: 'Recoding Limits',
      },
      {
        id: 13,
        name: '10s Recording Time Limits',
      },
    ],
  },
  {
    id: 2,
    name: 'Starter Plan',
    price: '$20.00',
    is_free: false,
    features: [
      {
        id: 21,
        name: 'Camera View',
      },
      {
        id: 22,
        name: '3 Recoding Limits',
      },
      {
        id: 23,
        name: '20s Recording Time Limits',
      },
    ],
  },
  {
    id: 3,
    name: 'Premium Plan',
    price: '$50.00',
    is_free: false,
    features: [
      {
        id: 31,
        name: 'Camera View',
      },
      {
        id: 32,
        name: '3 Recoding Limits',
      },
      {
        id: 33,
        name: '30s Recording Time Limits',
      },
    ],
  },
];
