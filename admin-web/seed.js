import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHcBLpG_b-zdkT7wacZfD4Dfde62m8IXU",
  authDomain: "ketnoifirebase-3a966.firebaseapp.com",
  projectId: "ketnoifirebase-3a966",
  storageBucket: "ketnoifirebase-3a966.firebasestorage.app",
  messagingSenderId: "851559898761",
  appId: "1:851559898761:web:0d0d79b1e0ce8f0d3e2fe0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seed = async () => {
  try {
    console.log("Seeding categories...");
    const cats = [
      {
        id: "ao-thun",
        name: "Áo thun",
        categoryId: "ao-thun",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
        productCount: 15
      },
      {
        id: "ao-khoac",
        name: "Áo khoác",
        categoryId: "ao-khoac",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
        productCount: 8
      },
      {
        id: "quan-jeans",
        name: "Quần Jeans",
        categoryId: "quan-jeans",
        imageUrl: "https://images.unsplash.com/photo-1542272604-780c40fb320c?auto=format&fit=crop&q=80&w=800",
        productCount: 12
      },
      {
        id: "giay-sneaker",
        name: "Giày Sneaker",
        categoryId: "giay-sneaker",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
        productCount: 20
      },
      {
        id: "phu-kien",
        name: "Phụ kiện",
        categoryId: "phu-kien",
        imageUrl: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=800",
        productCount: 35
      }
    ];

    for (const c of cats) {
      await setDoc(doc(db, "categories", c.id), {
        name: c.name,
        imageUrl: c.imageUrl,
        productCount: c.productCount,
        uploadedAt: new Date()
      });
      console.log("Added cat", c.name);
    }

    console.log("Seeding products...");
    const prods = [
      {
        id: "prod-1",
        name: "Áo Thun Basic Cotton T-Shirt",
        categoryId: "ao-thun",
        imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800",
        price: 150000,
        quantity: 120,
        status: "active",
        tags: ["Cotton", "Basic", "Summer"]
      },
      {
        id: "prod-2",
        name: "Áo Thun Oversize Streetwear",
        categoryId: "ao-thun",
        imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        price: 250000,
        quantity: 50,
        status: "active",
        tags: ["Oversize", "Streetwear"]
      },
      {
        id: "prod-3",
        name: "Áo Khoác Bomber Nam",
        categoryId: "ao-khoac",
        imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        price: 450000,
        quantity: 30,
        status: "active",
        tags: ["Bomber", "Jacket", "Winter"]
      },
      {
        id: "prod-4",
        name: "Quần Jeans Ống Rộng",
        categoryId: "quan-jeans",
        imageUrl: "https://images.unsplash.com/photo-1624378439575-d1ead6b6b718?auto=format&fit=crop&q=80&w=800",
        price: 350000,
        quantity: 40,
        status: "active",
        tags: ["Jeans", "Wide Leg"]
      },
      {
        id: "prod-5",
        name: "Giày Sneaker Chạy Bộ",
        categoryId: "giay-sneaker",
        imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800",
        price: 850000,
        quantity: 60,
        status: "active",
        tags: ["Running", "Sneaker", "Sport"]
      },
      {
        id: "prod-6",
        name: "Mắt Kính Thời Trang",
        categoryId: "phu-kien",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
        price: 120000,
        quantity: 200,
        status: "active",
        tags: ["Glasses", "Summer", "Accessories"]
      }
    ];

    for (const p of prods) {
      await setDoc(doc(db, "products", p.id), {
        name: p.name,
        categoryId: p.categoryId,
        imageUrl: p.imageUrl,
        price: p.price,
        quantity: p.quantity,
        status: p.status,
        tags: p.tags,
        uploadedAt: new Date()
      });
      console.log("Added prod", p.name);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding", error);
    process.exit(1);
  }
};

seed();
