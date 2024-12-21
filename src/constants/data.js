import Camera from '../../asset/svg/Camera.svg';
import Video from '../../asset/svg/Video.svg';
import Receipt from '../../asset/svg/Receipt.svg';
import Payment from '../../asset/svg/Payment.svg';

export const Products = [
  {id: '1', name: 'Camera', icon: Camera, screen: 'Choose Camera'},
  {id: '2', name: 'Recordings', icon: Video, screen: 'Recordings'},
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

export const RecordingOptions = [
  {
    id: 1,
    name: 'Videos',
  },
  {
    id: 2,
    name: 'Snapshots',
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
        name: '2 Recording Limits',
      },
      {
        id: 13,
        name: '10s Recording Time Limits',
      },
      {
        id: 14,
        name: '2 Snapshot Limits',
      },
    ],
  },
  {
    id: 2,
    name: 'Starter Plan',
    price: '$15.00',
    package_id: "com.standard.emmy",
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
      {
        id: 24,
        name: '3 Snapshot Limits',
      },
    ],
  },
  {
    id: 3,
    name: 'Advanced Plan',
    price: '$30.00',
    is_free: false,
    package_id: "com.advanced.emmy",
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
      {
        id: 34,
        name: '4 Snapshot Limits',
      },
    ],
  },
];

export const RecordingMenuOptions = [
  {
    id:1,
    icon: "share",
    title: "Share",
    description: "Effortlessly share your favorite content with friends and family using convenient sharing options."
  },
  {
    id:2,
    icon: "download",
    title: "Download",
    description: "Quickly download content to enjoy offline anytime, anywhere."
  },
  {
    id:3,
    icon: "cup",
    title: "Delete",
    description: "Permanently remove the media from your library."
  }
]

export const Recordings = [
  {id: 1, text: 'cat', value: 'https://i.imgur.com/CzXTtJV.jpg'},
  {id: 2, text: 'sail', value: 'https://farm7.staticflickr.com/6089/6115759179_86316c08ff_z_d.jpg'},
  {
    id: 3,
    text: 'cheetah',
    value: 'https://farm2.staticflickr.com/1533/26541536141_41abe98db3_z_d.jpg',
  },
  {
    id: 4,
    text: 'bird',
    value: 'https://farm4.staticflickr.com/3075/3168662394_7d7103de7d_z_d.jpg',
  },
  {
    id: 5,
    text: 'whale',
    value: 'https://farm9.staticflickr.com/8505/8441256181_4e98d8bff5_z_d.jpg',
  },
  {id: 6, text: 'bridge', value: 'https://i.imgur.com/OnwEDW3.jpg'},
  {
    id: 7,
    text: 'lighthouse',
    value: 'https://farm3.staticflickr.com/2220/1572613671_7311098b76_z_d.jpg',
  },
];
