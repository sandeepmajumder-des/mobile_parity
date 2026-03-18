// Shared app screens for MobileStudio (popup) and FlowStudio (flow)
export const appScreens = [
  {
    id: 1,
    name: 'Home',
    time: '27 minutes ago',
    isRecent: true,
    layout: 'food-home',
    headerTitle: 'FoodieExpress',
    accentColor: '#E23744',
    content: {
      greeting: 'Good Evening, John!',
      address: '123 Main Street, Apt 4B',
      categories: [
        { name: 'Pizza', emoji: '🍕' },
        { name: 'Burger', emoji: '🍔' },
        { name: 'Sushi', emoji: '🍣' },
        { name: 'Tacos', emoji: '🌮' }
      ],
      featured: [
        { name: "Mario's Pizza", rating: 4.5, time: '25-30 min', cuisine: 'Italian' },
        { name: 'Burger Barn', rating: 4.3, time: '20-25 min', cuisine: 'American' }
      ]
    }
  },
  {
    id: 2,
    name: 'Restaurant',
    time: '12 hours ago',
    isRecent: false,
    layout: 'food-restaurant',
    headerTitle: "Mario's Pizza",
    accentColor: '#E23744',
    content: {
      banner: '🍕',
      name: "Mario's Pizza",
      rating: 4.5,
      reviews: 234,
      time: '25-30 min',
      minOrder: '$15',
      menu: [
        { name: 'Margherita Pizza', price: '$12.99', desc: 'Fresh tomatoes, mozzarella, basil' },
        { name: 'Pepperoni Pizza', price: '$14.99', desc: 'Classic pepperoni, cheese blend' },
        { name: 'Garlic Bread', price: '$5.99', desc: 'Crispy with herb butter' }
      ]
    }
  },
  {
    id: 3,
    name: 'Cart',
    time: '12 hours ago',
    isRecent: false,
    layout: 'food-cart',
    headerTitle: 'Your Cart',
    accentColor: '#E23744',
    content: {
      restaurant: "Mario's Pizza",
      items: [
        { name: 'Margherita Pizza', qty: 1, price: '$12.99' },
        { name: 'Pepperoni Pizza', qty: 2, price: '$29.98' },
        { name: 'Garlic Bread', qty: 1, price: '$5.99' }
      ],
      subtotal: '$48.96',
      delivery: '$2.99',
      total: '$51.95'
    }
  },
  {
    id: 4,
    name: 'Order Tracking',
    time: '12 hours ago',
    isRecent: false,
    layout: 'food-tracking',
    headerTitle: 'Track Order',
    accentColor: '#E23744',
    content: {
      orderId: '#FE2847',
      status: 'On the way',
      eta: '12 min',
      driver: 'Mike R.',
      steps: [
        { label: 'Order Placed', done: true },
        { label: 'Preparing', done: true },
        { label: 'On the way', done: true, current: true },
        { label: 'Delivered', done: false }
      ]
    }
  },
]
