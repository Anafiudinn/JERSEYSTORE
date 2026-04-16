import Dexie, { type Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  stocks: Record<string, number>;
  images: string[];
  description: string;
  sku: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export interface Transaction {
  id?: number;
  items: CartItem[];
  total: number;
  customerName: string;
  amountPaid: number;
  change: number;
  timestamp: number;
  paymentMethod: 'cash' | 'transfer' | 'other';
}

export interface SystemLog {
  id?: number;
  action: string;
  details: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error';
}

export interface ShopSettings {
  id?: number;
  storeName: string;
  address: string;
  phone: string;
  currency: string;
}

export class AppDatabase extends Dexie {
  products!: Table<Product>;
  transactions!: Table<Transaction>;
  logs!: Table<SystemLog>;
  settings!: Table<ShopSettings>;

  constructor() {
    super('JerseySphereDB');
    this.version(1).stores({
      products: '++id, name, category, sku',
      transactions: '++id, timestamp, total',
      logs: '++id, timestamp, type',
      settings: '++id'
    });
  }
}

export const db = new AppDatabase();

// Initial data helper
export async function seedDatabase() {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      { 
        name: 'Manchester United Home 24/25', 
        category: 'Premier League', 
        price: 850000, 
        stocks: { 'S': 5, 'M': 10, 'L': 5, 'XL': 5 }, 
        images: ['https://images.footballfanatics.com/manchester-united/manchester-united-adidas-home-shirt-2024-25-kids_ss5_p-201089635+u-63z50wshf1hzhul0k6sc+v-7c703cc8310d481dae178553229babb2.jpg?_hv=2&w=900'], 
        description: 'Jersey home resmi Manchester United musim 2024/25. Mengusung desain klasik Setan Merah dengan teknologi HEAT.RDY untuk performa maksimal.',
        sku: 'MU-H-2425'
      },
      { 
        name: 'Real Madrid Home 24/25', 
        category: 'La Liga', 
        price: 950000, 
        stocks: { 'M': 5, 'L': 5, 'XL': 5, 'XXL': 3 }, 
        images: ['https://images.footballfanatics.com/real-madrid/real-madrid-adidas-home-shirt-2024-25_ss5_p-201079316+u-i0f3p9j1d8i9w8v8i8j8+v-da6364020f014f3faf66050604f1df91.jpg?_hv=2&w=900'], 
        description: 'Hala Madrid! Jersey home Real Madrid 2024/25 dengan sentuhan elegan warna putih bersih dan detail emas yang merepresentasikan kejayaan Los Blancos.',
        sku: 'RM-H-2425'
      },
      { 
        name: 'Indonesia National Team Home 2024', 
        category: 'National', 
        price: 750000, 
        stocks: { 'S': 10, 'M': 20, 'L': 15, 'XL': 10, 'XXL': 5 }, 
        images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'], 
        description: 'Jersey kebanggaan Timnas Indonesia 2024. Semangat Garuda dalam balutan warna merah berani, cocok untuk mendukung tim kesayangan di stadion.',
        sku: 'INA-H-2024'
      },
      { 
        name: 'Liverpool FC Home 24/25', 
        category: 'Premier League', 
        price: 850000, 
        stocks: { 'S': 4, 'M': 4, 'L': 4 }, 
        images: ['https://images.footballfanatics.com/liverpool/liverpool-nike-home-stadium-shirt-2024-25_ss5_p-201089531+u-a75d691bc67e42d8815f+v-00302bda682243d68846c2bceb812f8a.jpg?_hv=2&w=900'], 
        description: 'You Will Never Walk Alone. Jersey Liverpool 2024/25 dengan nuansa retro yang terinspirasi dari era keemasan klub di tahun 80-an.',
        sku: 'LIV-H-2425'
      },
      { 
        name: 'Juventus FC Home 24/25', 
        category: 'Serie A', 
        price: 890000, 
        stocks: { 'S': 8, 'M': 12, 'L': 6 }, 
        images: ['https://images.footballfanatics.com/juventus/juventus-adidas-home-shirt-2024-25_ss5_p-201089600+u-a75d691bc67e42d8815f+v-00302bda682243d68846c2bceb812f8a.jpg?_hv=2&w=900'], 
        description: 'Bianconeri! Garis-garis ikonik hitam putih Juventus kembali hadir dengan desain yang lebih modern dan minimalis untuk musim 24/25.',
        sku: 'JUV-H-2425'
      },
      { 
        name: 'AC Milan Home 24/25', 
        category: 'Serie A', 
        price: 870000, 
        stocks: { 'M': 15, 'L': 10, 'XL': 5 }, 
        images: ['https://images.footballfanatics.com/ac-milan/ac-milan-puma-home-shirt-2024-25_ss5_p-201089300+u-a75d691bc67e42d8815f+v-00302bda682243d68846c2bceb812f8a.jpg?_hv=2&w=900'], 
        description: 'Forza Milan! Jersey Rossoneri 24/25 merayakan tradisi klub dengan garis-garis vertikal klasik yang melambangkan DNA juara AC Milan.',
        sku: 'ACM-H-2425'
      },
      { 
        name: 'Paris Saint-Germain Home 24/25', 
        category: 'Ligue 1', 
        price: 920000, 
        stocks: { 'S': 5, 'M': 10, 'L': 10 }, 
        images: ['https://images.footballfanatics.com/psg/psg-nike-home-stadium-shirt-2024-25_ss5_p-201089400+u-a75d691bc67e42d8815f+v-00302bda682243d68846c2bceb812f8a.jpg?_hv=2&w=900'], 
        description: 'Ici c\'est Paris! Jersey PSG 24/25 menghadirkan gaya Hechter yang ikonik dengan sentuhan artistik khas kota Paris.',
        sku: 'PSG-H-2425'
      },
      { 
        name: 'Bayern Munich Home 24/25', 
        category: 'Bundesliga', 
        price: 880000, 
        stocks: { 'L': 20, 'XL': 15 }, 
        images: ['https://images.footballfanatics.com/bayern-munich/bayern-munich-adidas-home-shirt-2024-25_ss5_p-201089500+u-a75d691bc67e42d8815f+v-00302bda682243d68846c2bceb812f8a.jpg?_hv=2&w=900'], 
        description: 'Mia San Mia! Dominasi warna merah menyala pada jersey Bayern Munich 24/25 mencerminkan ambisi klub untuk menyapu bersih semua gelar.',
        sku: 'BAY-H-2425'
      },
    ]);
    
    await db.settings.add({
      storeName: 'JerseySphere UMKM',
      address: 'Jl. Sepak Bola No. 10, Jakarta',
      phone: '0812-3456-7890',
      currency: 'IDR'
    });

    await db.logs.add({
      action: 'Database Initialized',
      details: 'System database seeded with initial products and settings.',
      timestamp: Date.now(),
      type: 'info'
    });
  }
}
