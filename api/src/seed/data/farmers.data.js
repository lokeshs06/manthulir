// Sample farmers for local development/demo — one cluster (first two
// farmers), a mix of transition statuses, districts, and crops.
export const farmersSeedData = [
  {
    name: 'Murugan S',
    phone: '9000000001',
    district: 'Thanjavur',
    landSizeAcres: 3.5,
    crops: ['paddy', 'tomato'],
    transitionStatus: 'transitioning',
  },
  {
    name: 'Kalaiselvi R',
    phone: '9000000002',
    district: 'Thanjavur',
    landSizeAcres: 2,
    crops: ['paddy', 'brinjal'],
    transitionStatus: 'transitioning',
  },
  {
    name: 'Rajendran K',
    phone: '9000000003',
    district: 'Madurai',
    landSizeAcres: 5,
    crops: ['cotton'],
    transitionStatus: 'not_started',
  },
  {
    name: 'Valarmathi P',
    phone: '9000000004',
    district: 'Coimbatore',
    landSizeAcres: 1.5,
    crops: ['vegetables'],
    transitionStatus: 'transitioning',
  },
  {
    name: 'Selvam T',
    phone: '9000000005',
    district: 'Erode',
    landSizeAcres: 4,
    crops: ['tomato', 'chilli'],
    transitionStatus: 'certified',
  },
];
