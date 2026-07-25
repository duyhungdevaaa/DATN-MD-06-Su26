/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActiveTab, Product, Category, User, Order, ProductStatus, UserTier, OrderStatus } from "./types";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { InventoryView } from "./components/InventoryView";
import { ProductFormView } from "./components/ProductFormView";
import { CategoryListView } from "./components/CategoryListView";
import { CategoryFormView } from "./components/CategoryFormView";
import { UserListView } from "./components/UserListView";
import { OrderListView } from "./components/OrderListView";
import { OrderDetailView } from "./components/OrderDetailView";

import { collection, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { LoginView } from "./components/LoginView";

// Fallback mock users since original Firebase did not have a dedicated users collection
const DEFAULT_USERS: User[] = [
  {
    id: "TRND-8291",
    name: "Lê Minh Anh",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1clbHOyNnTR6QDB36NmyYLKJrqsWG5-dw9EtcvafNBF-j3DmpziQAIZfwfX_jLbzC170zrvqvrK1V3Umb4rcu-tYXHCaVv7OvuCTzN8K8FVaSSoUlypyLBIsbLTrBMh72KDhnnwmFExWy9k35ioRh471TNGqYpx-oK8qd8o0GHgjNRdUaoRvCEa0hXHK4fbkHm81RR5BpFuxOi8_cFCINEXaDG5YQb1FLGF2z3G-F2etHiWFVrdmfQF0B8u42f3Tg3hpEMXYZh0A",
    tier: UserTier.GOLD,
    email: "minhanh.le@example.com",
    joinedDate: "12/10/2023"
  }
];

export default function App() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Navigation Routing States
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.DASHBOARD);
  const [searchText, setSearchText] = useState("");

  // Firebase Real-time Databases
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS); // Mocked for now

  // Focus and Active detail states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form rendering states (controls creation or update redirection)
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Authentication listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubAuth();
  }, []);

  // Load data from Firebase on mount
  useEffect(() => {
    if (!authUser) return; // Only listen to database if authenticated

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const loadedProds: Product[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const quantity = data.quantity || 0;
        const status = ProductStatus.ACTIVE;
        
        return {
          id: docSnap.id,
          sku: `TRN-${docSnap.id.substring(0, 4).toUpperCase()}`,
          name: data.name || "Sản phẩm",
          description: data.tags ? data.tags.join(', ') : "",
          categoryName: data.categoryId || "Apparel",
          price: data.price || 0,
          stock: quantity,
          status,
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
          lastModified: data.uploadedAt ? new Date(data.uploadedAt.seconds * 1000).toLocaleDateString() : "Vừa xong"
        };
      });
      setProducts(loadedProds);
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const loadedCats: Category[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || "Danh mục",
          description: "",
          isLive: data.isLive !== false,
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600",
          slug: data.slug || docSnap.id,
          productCount: data.productCount || 0,
          lastUpdated: data.uploadedAt ? new Date(data.uploadedAt.seconds * 1000).toLocaleDateString() : "Unknown",
          updatedBy: "Admin"
        };
      });
      setCategories(loadedCats);
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const loadedOrders: Order[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const createdDate = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();
        
        let status = OrderStatus.PENDING;
        if (data.status === "Đã giao") status = OrderStatus.DELIVERED;
        else if (data.status === "Đang xử lý") status = OrderStatus.SHIPPING;
        else if (data.status === "Đã hủy") status = OrderStatus.CANCELLED;

        return {
          id: docSnap.id,
          customerName: data.userId || "Khách hàng",
          customerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx0BytEzbLFBt7DZ-Usl9CoGOMmn3pka2w2C-VaTEzI0u9G5YDjLKH_k2SYEizcrJHowoz_uvob6rCujIkBm9_Il0bgp1yWsoaeWPAScV_-Ve4nNiMP3Ks4da4iIFLajJ48jmLkQ9e7Q09fBtq_RV8F7IBg-n31usB1gHlqxvAjEvoo0W8IC-UryWomSVJnCF8gzH2YwPvFdL5KaagiWtrQXngCpio2zGNGMEmhNKbL4c20Wfnpaf950gD4wfxNynPvx13KwqQXiM",
          email: "",
          phone: "",
          address: data.address || "Tại cửa hàng",
          subtotal: data.total || 0,
          shippingFee: 0,
          total: data.total || 0,
          paymentMethod: data.paymentMethod || "COD",
          paymentEndingCard: "",
          status,
          date: createdDate.toLocaleDateString(),
          time: createdDate.toLocaleTimeString(),
          items: data.items || [],
          timeline: {
            confirmed: { active: true, time: createdDate.toLocaleString() },
            packing: { active: status !== OrderStatus.PENDING, time: "" },
            shipping: { active: status === OrderStatus.SHIPPING || status === OrderStatus.DELIVERED, time: "" },
            delivered: { active: status === OrderStatus.DELIVERED, time: "" }
          }
        };
      });
      setOrders(loadedOrders);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const loadedUsers: User[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const joinedDate = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString();
        
        // Match generic string with UserTier enum or default to GUEST
        let tierValue = UserTier.GUEST;
        if (data.tier === "GOLD") tierValue = UserTier.GOLD;
        else if (data.tier === "SILVER") tierValue = UserTier.SILVER;

        return {
          id: docSnap.id,
          name: data.name || data.displayName || data.email?.split('@')[0] || "Khách hàng",
          email: data.email || "Chưa cập nhật",
          avatar: data.photoURL || data.avatarUrl || data.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
          tier: tierValue,
          joinedDate: joinedDate
        };
      });
      if (loadedUsers.length > 0) {
        setUsers(loadedUsers);
      } else {
        setUsers([]); // Clear defaults if no users found
      }
    }, (error) => {
      console.warn("Could not load users collection, falling back.", error);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubUsers();
    };
  }, [authUser]);

  const uploadImageIfBase64 = async (imageUrl: string, folder: string): Promise<string> => {
    if (!imageUrl.startsWith("data:")) return imageUrl;
    try {
      const fileName = `${folder}/${Date.now()}.png`;
      const storageRef = ref(storage, fileName);
      await uploadString(storageRef, imageUrl, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      return imageUrl;
    }
  };

  // --- CRUD Actions for Products ---
  const handleSaveProduct = async (payload: Partial<Product>) => {
    try {
      const finalImageUrl = payload.imageUrl ? await uploadImageIfBase64(payload.imageUrl, "products") : "";
      const docData: any = {
        name: payload.name,
        price: payload.price,
        categoryId: payload.categoryName,
        quantity: payload.stock,
        tags: payload.description ? [payload.description] : [],
        uploadedAt: new Date()
      };
      
      if (finalImageUrl) docData.imageUrl = finalImageUrl;

      if (payload.id && !payload.id.startsWith("prod-")) {
        // EDIT mode
        const docRef = doc(db, "products", payload.id);
        await updateDoc(docRef, docData);
      } else {
        // ADD mode
        if (!docData.imageUrl) {
            docData.imageUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600";
        }
        await addDoc(collection(db, "products"), docData);
      }
    } catch (e) {
      console.error("Error saving product:", e);
    }

    setEditingProduct(null);
    setIsAddingProduct(false);
    setActiveTab(ActiveTab.PRODUCTS);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (e) {
      console.error("Error deleting product:", e);
    }
  };

  // --- CRUD Actions for Categories ---
  const handleSaveCategory = async (payload: Partial<Category>) => {
    try {
      const finalImageUrl = payload.imageUrl ? await uploadImageIfBase64(payload.imageUrl, "categories") : "";
      const docData: any = {
        name: payload.name,
        slug: payload.slug,
        isLive: payload.isLive,
        uploadedAt: new Date()
      };
      
      if (finalImageUrl) docData.imageUrl = finalImageUrl;

      if (payload.id && !payload.id.startsWith("cat-")) {
        // EDIT mode
        await updateDoc(doc(db, "categories", payload.id), docData);
      } else {
        // ADD mode using slug as ID if we want, or let Firebase auto-generate
        const newId = payload.slug || Date.now().toString();
        await setDoc(doc(db, "categories", newId), docData, { merge: true });
      }
    } catch (e) {
      console.error("Error saving category:", e);
    }

    setEditingCategory(null);
    setIsAddingCategory(false);
    setActiveTab(ActiveTab.CATEGORIES);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, "categories", categoryId));
    } catch (e) {
      console.error("Error deleting category:", e);
    }
  };

  const handleToggleLiveCategory = async (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat) {
      try {
        await updateDoc(doc(db, "categories", categoryId), { isLive: !cat.isLive });
      } catch (e) {
        console.error("Error toggling live status:", e);
      }
    }
  };

  // --- User Operations ---
  const handleUpdateUserTier = (userId: string, newTier: UserTier) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, tier: newTier };
      }
      return u;
    });
    setUsers(updated); // Just local memory
  };

  // --- Order Operations ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Find the order to retrieve its items
      const targetOrder = orders.find(o => o.id === orderId);
      
      // Auto-restore stock if cancelling an order that wasn't already cancelled
      if (newStatus === OrderStatus.CANCELLED && targetOrder && targetOrder.status !== OrderStatus.CANCELLED) {
        for (const item of targetOrder.items) {
          if (item.id) {
            const productRef = doc(db, "products", item.id);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const currentQty = productSnap.data().quantity || 0;
              const currentVariants = productSnap.data().variants || [];
              
              // Restore overall stock quantity
              const newQty = currentQty + item.quantity;
              const updates: any = { quantity: newQty };
              
              // If product has size & color variants, restore variant-specific quantity as well!
              if (item.size && item.color && currentVariants.length > 0) {
                const updatedVariants = currentVariants.map((v: any) => {
                  if (v.size === item.size && v.color === item.color) {
                    return { ...v, quantity: (v.quantity || 0) + item.quantity };
                  }
                  return v;
                });
                updates.variants = updatedVariants;
              }
              
              await updateDoc(productRef, updates);
            }
          }
        }
      }

      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      
      // Update selected order view dynamically
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e) {
      console.error("Error updating order status:", e);
    }
  };

  // Switch workspace layout context dynamically
  const renderActiveView = () => {
    switch (activeTab) {
      
      case ActiveTab.DASHBOARD:
        return (
          <DashboardView
            products={products}
            orders={resolvedOrders}
            users={users}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              // Clean selection focus
              setSelectedOrder(null);
              setEditingProduct(null);
              setEditingCategory(null);
              setIsAddingProduct(false);
              setIsAddingCategory(false);
            }}
            onSelectOrder={(order) => setSelectedOrder(order)}
          />
        );

      case ActiveTab.PRODUCTS:
        if (isAddingProduct || editingProduct) {
          // List of current categories names for form drop-down
          // Use category IDs so that the DB holds category ID correctly
          const catNames = categories.map(c => c.id);
          return (
            <ProductFormView
              editingProduct={editingProduct}
              categories={catNames.length > 0 ? catNames : ["Apparel", "Accessories", "Footwear"]}
              onSaveProduct={handleSaveProduct}
              onCancel={() => {
                setEditingProduct(null);
                setIsAddingProduct(false);
              }}
            />
          );
        }
        return (
          <InventoryView
            products={products}
            searchText={searchText}
            onAddProductClick={() => setIsAddingProduct(true)}
            onEditProductClick={(prod) => setEditingProduct(prod)}
            onDeleteProduct={handleDeleteProduct}
          />
        );

      case ActiveTab.CATEGORIES:
        if (isAddingCategory || editingCategory) {
          return (
            <CategoryFormView
              editingCategory={editingCategory}
              onSaveCategory={handleSaveCategory}
              onCancel={() => {
                setEditingCategory(null);
                setIsAddingCategory(false);
              }}
            />
          );
        }
        return (
          <CategoryListView
            categories={categories}
            onAddCategoryClick={() => setIsAddingCategory(true)}
            onEditCategoryClick={(cat) => setEditingCategory(cat)}
            onDeleteCategory={handleDeleteCategory}
            onToggleLive={handleToggleLiveCategory}
          />
        );

      case ActiveTab.USERS:
        return (
          <UserListView
            users={users}
            searchText={searchText}
            onUpdateUserTier={handleUpdateUserTier}
          />
        );

      case ActiveTab.ORDERS:
        if (selectedOrder) {
          const resolvedSelectedOrder = resolvedOrders.find(o => o.id === selectedOrder.id) || selectedOrder;
          return (
            <OrderDetailView
              order={resolvedSelectedOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onCancel={() => setSelectedOrder(null)}
            />
          );
        }
        return (
          <OrderListView
            orders={resolvedOrders}
            searchText={searchText}
            onSelectOrder={(order) => setSelectedOrder(order)}
          />
        );

      default:
        return (
          <div className="bg-white rounded-xl border border-[#cfc4c5]/40 p-16 text-center custom-shadow font-sans">
            <h3 className="font-serif text-xl font-bold text-neutral-800">Cài đặt phân quyền hệ thống</h3>
            <p className="text-xs text-neutral-500 mt-2">
              Các thông số và tài khoản quản trị hoạt động ở chế độ khép kín.
            </p>
          </div>
        );
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#6c5e06] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Đang kết nối hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <LoginView />;
  }

  return (
    <div className="flex bg-[#fbf9f9] min-h-screen text-[#1b1c1c] font-sans selection:bg-neutral-200">
      
      {/* 1. Permanent Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // clean secondary layouts focus
          setSelectedOrder(null);
          setEditingProduct(null);
          setEditingCategory(null);
          setIsAddingProduct(false);
          setIsAddingCategory(false);
        }}
        productCount={products.length}
        orderCount={orders.filter(o => o.status === OrderStatus.PENDING).length}
        onLogout={handleLogout}
      />

      {/* 2. Right core workspace column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top persistent Header bar with dynamic clock & real-time search */}
        <Header searchText={searchText} setSearchText={setSearchText} />

        {/* Scaled main content view */}
        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {renderActiveView()}
        </main>
        
      </div>

    </div>
  );
}
