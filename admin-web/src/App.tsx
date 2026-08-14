/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActiveTab, Product, Category, User, Order, ProductStatus, UserTier, OrderStatus, Voucher } from "./types";
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
import { VoucherListView } from "./components/VoucherListView";
import { VoucherFormView } from "./components/VoucherFormView";
import { NotificationsView } from "./components/NotificationsView";
import { BannersView } from "./components/BannersView";

import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, increment } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { LoginView } from "./components/LoginView";

import { parseRawAddress, fetchGHNDistricts, fetchGHNWards } from "./utils/ghn";

// Fallback mock users since original Firebase did not have a dedicated users collection
const DEFAULT_USERS: User[] = [];

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
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Focus and Active detail states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form rendering states (controls creation or update redirection)
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);

  useEffect(() => {
    fetchGHNDistricts();
  }, []);

  // Dynamically resolve customer details & parse raw GHN addresses for orders
  const resolvedOrders = React.useMemo(() => {
    return orders.map(order => {
      const parsed = parseRawAddress(order.address);
      if (parsed.districtId) {
        fetchGHNWards(parsed.districtId);
      }
      
      const user = users.find(u => u.id === order.userId || u.id === order.customerName || (order.email && u.email === order.email));
      
      let realPhone = "";
      if (parsed.extractedPhone && !parsed.extractedPhone.includes("x")) {
        realPhone = parsed.extractedPhone;
      } else if (order.phone && !order.phone.includes("x")) {
        realPhone = order.phone;
      } else if (user?.phone && !user.phone.includes("x")) {
        realPhone = user.phone;
      } else {
        realPhone = "Chưa có SĐT";
      }

      let realName = order.customerName;
      if (user && user.name && !user.name.startsWith("ORD-")) {
        realName = user.name;
      } else if (parsed.extractedName) {
        realName = parsed.extractedName;
      }

      return {
        ...order,
        customerName: realName,
        customerAvatar: user ? user.avatar : order.customerAvatar,
        email: user ? user.email : order.email,
        phone: realPhone,
        address: parsed.cleanAddress
      };
    });
  }, [orders, users]);

  // Dynamically resolve product count for categories
  const resolvedCategories = React.useMemo(() => {
    return categories.map(cat => {
      const count = products.filter(p => {
        const pCat = (p.categoryName || "").toLowerCase().trim();
        const cId = (cat.id || "").toLowerCase().trim();
        const cName = (cat.name || "").toLowerCase().trim();
        const cSlug = (cat.slug || "").toLowerCase().trim();
        return pCat === cId || pCat === cName || pCat === cSlug;
      }).length;

      return {
        ...cat,
        productCount: count
      };
    });
  }, [categories, products]);




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
        const status = (data.status as ProductStatus) || ProductStatus.ACTIVE;
        
        return {
          id: docSnap.id,
          sku: `TRN-${docSnap.id.substring(0, 4).toUpperCase()}`,
          name: data.name || "Sản phẩm",
          description: data.tags ? data.tags.join(', ') : "",
          categoryName: data.categoryId || "Apparel",
          price: data.price || 0,
          discount: data.discount || 0,
          stock: quantity,
          status,
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
          lastModified: data.uploadedAt ? new Date(data.uploadedAt.seconds * 1000).toLocaleDateString() : "Vừa xong",
          sizes: data.sizes || [],
          colors: data.colors || [],
          variants: data.variants || []
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

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const loadedUsers: User[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const joinedDate = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString();
        
        let tierValue = UserTier.GUEST;
        if (data.tier === "GOLD") tierValue = UserTier.GOLD;
        else if (data.tier === "SILVER") tierValue = UserTier.SILVER;

        return {
          id: docSnap.id,
          name: data.fullName || data.name || data.displayName || data.email?.split('@')[0] || "Khách hàng",
          email: data.email || "Chưa cập nhật",
          avatar: data.photoURL || data.avatarUrl || data.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
          phone: data.phone || data.phoneNumber || data.sdt || "",
          tier: tierValue,
          joinedDate: joinedDate
        };
      });
      setUsers(loadedUsers);

      // Also listen to orders and populate missing customer info from loadedUsers
      onSnapshot(collection(db, "orders"), (orderSnapshot) => {
        const loadedOrders: Order[] = orderSnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const createdDate = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();
          
          let status = OrderStatus.AWAITING_PAYMENT;
          if (data.status === "Đã giao" || data.status === "Da giao" || data.status === "Đã giao hàng") {
            status = OrderStatus.DELIVERED;
          } else if (data.status === "Đang vận chuyển" || data.status === "Dang van chuyen" || data.status === "Đang giao hàng") {
            status = OrderStatus.SHIPPING;
          } else if (data.status === "Đang xử lý" || data.status === "Dang xu ly") {
            status = OrderStatus.PROCESSING;
          } else if (data.status === "Đã hủy" || data.status === "Da huy") {
            status = OrderStatus.CANCELLED;
          } else if (data.status === "Trả hàng/Hoàn tiền" || data.status === "Tra hang/Hoan tien" || data.status === "Trả hàng/Hoàn đơn") {
            status = OrderStatus.REFUNDED;
          } else if (data.status === "Đã hoàn tiền" || data.status === "Da hoan tien") {
            status = OrderStatus.REFUND_COMPLETED;
          } else if (data.status === "Chờ thanh toán" || data.status === "Cho thanh toan" || data.status === "Chờ xác nhận" || data.status === "Cho xac nhan") {
            status = OrderStatus.AWAITING_PAYMENT;
          }

          // Cross reference with loadedUsers if order field is missing
          const matchingUser = loadedUsers.find(u => u.id === data.userId || (data.email && u.email === data.email));
          const customerPhone = data.phone || data.sdt || data.phoneNumber || data.recipientPhone || (matchingUser?.phone ? matchingUser.phone : "");
          const customerName = data.customerName || data.name || data.recipientName || data.fullName || (matchingUser?.name ? matchingUser.name : "Khách hàng");
          const customerAvatar = data.customerAvatar || data.avatar || (matchingUser?.avatar ? matchingUser.avatar : "https://lh3.googleusercontent.com/aida-public/AB6AXuAx0BytEzbLFBt7DZ-Usl9CoGOMmn3pka2w2C-VaTEzI0u9G5YDjLKH_k2SYEizcrJHowoz_uvob6rCujIkBm9_Il0bgp1yWsoaeWPAScV_-Ve4nNiMP3Ks4da4iIFLajJ48jmLkQ9e7Q09fBtq_RV8F7IBg-n31usB1gHlqxvAjEvoo0W8IC-UryWomSVJnCF8gzH2YwPvFdL5KaagiWtrQXngCpio2zGNGMEmhNKbL4c20Wfnpaf950gD4wfxNynPvx13KwqQXiM");
          const email = data.email || (matchingUser?.email ? matchingUser.email : "");

          return {
            id: docSnap.id,
            userId: data.userId || "",
            customerName,
            customerAvatar,
            email,
            phone: customerPhone,
            address: data.address || data.shippingAddress || "Tại cửa hàng",
            subtotal: data.total || 0,
            shippingFee: data.shippingFee || 0,
            total: data.total || 0,
            paymentMethod: data.paymentMethod || "COD",
            paymentEndingCard: "",
            status,
            date: createdDate.toLocaleDateString(),
            time: createdDate.toLocaleTimeString(),
            items: data.items || [],
            timestamp: createdDate.getTime(),
            timeline: {
              confirmed: { active: true, time: createdDate.toLocaleString() },
              packing: { active: status !== OrderStatus.AWAITING_PAYMENT && status !== OrderStatus.CANCELLED, time: "" },
              shipping: { active: status === OrderStatus.SHIPPING || status === OrderStatus.DELIVERED || status === OrderStatus.REFUNDED, time: "" },
              delivered: { active: status === OrderStatus.DELIVERED || status === OrderStatus.REFUNDED, time: "" }
            }
          } as Order & { timestamp: number };
        });
        loadedOrders.sort((a: any, b: any) => b.timestamp - a.timestamp);
        setOrders(loadedOrders);
      });
    });


    const unsubVouchers = onSnapshot(collection(db, "vouchers"), (snapshot) => {
      const loadedVouchers: Voucher[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          code: data.code || "",
          discountAmount: data.discountAmount || 0,
          discountRate: data.discountRate || 0,
          maximumDiscount: data.maximumDiscount || 0,
          expirationDate: data.expirationDate || ""
        };
      });
      setVouchers(loadedVouchers);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubUsers();
      unsubVouchers();
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
        discount: payload.discount || 0,
        categoryId: payload.categoryName,
        quantity: payload.stock,
        tags: payload.description ? [payload.description] : [],
        status: payload.status || ProductStatus.ACTIVE,
        uploadedAt: new Date(),
        sizes: payload.sizes || [],
        colors: payload.colors || [],
        variants: payload.variants || []
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

  // --- CRUD Actions for Vouchers ---
  const handleSaveVoucher = async (payload: Partial<Voucher>) => {
    try {
      const docData = {
        code: payload.code,
        discountAmount: payload.discountAmount || 0,
        discountRate: payload.discountRate || 0,
        maximumDiscount: payload.maximumDiscount || 0,
        expirationDate: payload.expirationDate
      };

      if (payload.id) {
        await updateDoc(doc(db, "vouchers", payload.id), docData);
      } else {
        await addDoc(collection(db, "vouchers"), docData);
      }
    } catch (e) {
      console.error("Error saving voucher:", e);
    }

    setEditingVoucher(null);
    setIsAddingVoucher(false);
    setActiveTab(ActiveTab.VOUCHERS);
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      await deleteDoc(doc(db, "vouchers", voucherId));
    } catch (e) {
      console.error("Error deleting voucher:", e);
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
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();

        // 1. Nếu hủy đơn hàng, thực hiện hoàn tiền và hoàn kho
        if (newStatus === OrderStatus.CANCELLED && orderData.status !== OrderStatus.CANCELLED) {
          const paymentMethod = orderData.paymentMethod || "COD";
          const total = parseInt(orderData.total || 0, 10);
          const walletAmountUsed = orderData.walletAmountUsed || 0;
          let amountToRefund = 0;

          if (paymentMethod !== "COD") {
            amountToRefund = total + walletAmountUsed;
          } else {
            amountToRefund = walletAmountUsed;
          }

          if (amountToRefund > 0 && orderData.userId) {
            const userRef = doc(db, "users", orderData.userId);
            await updateDoc(userRef, {
              walletBalance: increment(amountToRefund)
            });

            await addDoc(collection(db, "transactions"), {
              userId: orderData.userId,
              amount: amountToRefund,
              type: "REFUND",
              description: "Hoàn tiền tự động do hủy đơn hàng " + orderId,
              timestamp: new Date().toISOString()
            });
          }

          const items = orderData.items || [];
          for (const item of items) {
            const productId = item.productId || item.cartItemId;
            let quantity = 0;
            if (typeof item.quantity === 'string') {
                try { quantity = parseInt(item.quantity, 10); } catch(e) {}
            } else {
                quantity = item.quantity || 0;
            }
            if (productId && quantity > 0) {
              const productRef = doc(db, "products", productId);
              await updateDoc(productRef, {
                stock: increment(quantity)
              });
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

  const handleApproveRefund = async (orderId: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        const refundAmount = orderData.returnRefundAmount || 0;
        const userId = orderData.userId;
        
        if (userId && refundAmount > 0) {
          const userRef = doc(db, "users", userId);
          // Increment wallet balance
          await updateDoc(userRef, {
            walletBalance: increment(refundAmount)
          });
        }
        
        await updateDoc(orderRef, { status: "Đã hoàn tiền" });
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: OrderStatus.REFUND_COMPLETED });
        }
      }
    } catch (e) {
      console.error("Error approving refund:", e);
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
            categories={resolvedCategories}
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
              onApproveRefund={handleApproveRefund}
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


      case ActiveTab.VOUCHERS:
        if (isAddingVoucher || editingVoucher) {
          return (
            <VoucherFormView
              editingVoucher={editingVoucher}
              onSaveVoucher={handleSaveVoucher}
              onCancel={() => {
                setEditingVoucher(null);
                setIsAddingVoucher(false);
              }}
            />
          );
        }
        return (
          <VoucherListView
            vouchers={vouchers}
            searchText={searchText}
            onAddVoucherClick={() => setIsAddingVoucher(true)}
            onEditVoucherClick={(voucher) => setEditingVoucher(voucher)}
            onDeleteVoucher={handleDeleteVoucher}
          />
        );

      case ActiveTab.NOTIFICATIONS:
        return <NotificationsView />;

      case ActiveTab.BANNERS:
        return <BannersView />;

      default:
        return (
          <div className="bg-white rounded-2xl border border-zinc-200/50 p-16 text-center shadow-sm font-sans">
            <h3 className="font-serif text-xl font-bold text-zinc-950">Cài đặt phân quyền hệ thống</h3>
            <p className="text-xs text-zinc-500 mt-2 font-medium">
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#8c7623] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Đang kết nối hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <LoginView />;
  }

  return (
    <div className="flex bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-zinc-200 selection:text-zinc-900">
      
      {/* 1. Permanent Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // clean secondary layouts focus
          setSelectedOrder(null);
          setEditingProduct(null);
          setEditingCategory(null);
          setEditingVoucher(null);
          setIsAddingProduct(false);
          setIsAddingCategory(false);
          setIsAddingVoucher(false);
        }}
        productCount={products.length}
        orderCount={orders.filter(o => o.status === OrderStatus.AWAITING_PAYMENT || o.status === OrderStatus.PROCESSING).length}
        onLogout={handleLogout}
      />

      {/* 2. Right core workspace column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top persistent Header bar with dynamic clock & real-time search */}
        <Header searchText={searchText} setSearchText={setSearchText} />

        {/* Scaled main content view */}
        <main className="p-6 w-full flex-1 min-w-0">
          {renderActiveView()}
        </main>

        
      </div>

    </div>
  );
}
