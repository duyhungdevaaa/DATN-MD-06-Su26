/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActiveTab, Product, Category, User, Order, ProductStatus, UserTier, OrderStatus, Voucher, ReturnedInventoryItem } from "./types";
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
import { ReturnsView } from "./components/ReturnsView";
import { VoucherListView } from "./components/VoucherListView";
import { VoucherFormView } from "./components/VoucherFormView";
import { NotificationsView } from "./components/NotificationsView";
import { BannersView } from "./components/BannersView";

import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, increment, query, where, getDocs } from "firebase/firestore";
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
  const [returnedInventory, setReturnedInventory] = useState<ReturnedInventoryItem[]>([]);

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

  const resolvedOrders = React.useMemo(() => {
    return orders.map(order => {
      const parsed = parseRawAddress(order.address);
      if (parsed.districtId) {
        fetchGHNWards(parsed.districtId);
      }
      
      const user = users.find(u => u.id === order.userId || (order.email && u.email === order.email));
      
      // Thông tin Người đặt hàng (Tài khoản đặt mua)
      const ordererName = user?.name || (order.customerName && !order.customerName.startsWith("ORD-") ? order.customerName : "Khách hàng");
      const ordererEmail = user?.email || order.email || "Chưa có email";
      const ordererPhone = user?.phone || "";

      // Thông tin Người nhận hàng (Thông tin nhận & địa chỉ giao)
      const recipientName = parsed.extractedName || order.recipientName || ordererName;
      let recipientPhone = "";
      if (parsed.extractedPhone && !parsed.extractedPhone.includes("x")) {
        recipientPhone = parsed.extractedPhone;
      } else if (order.recipientPhone && !order.recipientPhone.includes("x")) {
        recipientPhone = order.recipientPhone;
      } else if (order.phone && !order.phone.includes("x")) {
        recipientPhone = order.phone;
      } else if (user?.phone && !user.phone.includes("x")) {
        recipientPhone = user.phone;
      } else {
        recipientPhone = "Chưa có SĐT";
      }

      const recipientAddress = parsed.cleanAddress || order.address || "Tại cửa hàng";

      return {
        ...order,
        ordererName,
        ordererEmail,
        ordererPhone,
        recipientName,
        recipientPhone,
        recipientAddress,
        customerName: ordererName,
        customerAvatar: user ? user.avatar : order.customerAvatar,
        email: ordererEmail,
        phone: recipientPhone,
        address: recipientAddress
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
          
          const rawStatus = (data.status || "").toString().toLowerCase();
          let status = OrderStatus.AWAITING_PAYMENT;
          if (rawStatus.includes("đã hoàn tiền") || rawStatus.includes("da hoan tien") || data.returnStatus === "APPROVED") {
            status = OrderStatus.REFUND_COMPLETED;
          } else if (
            rawStatus.includes("trả hàng") || 
            rawStatus.includes("tra hang") || 
            rawStatus.includes("hoàn") || 
            rawStatus.includes("hoan") || 
            data.isReturnRequested === true || 
            (Array.isArray(data.returnedItems) && data.returnedItems.length > 0) ||
            Boolean(data.returnReason)
          ) {
            status = OrderStatus.REFUNDED;
          } else if (rawStatus.includes("đã giao") || rawStatus.includes("da giao") || rawStatus.includes("thành công") || rawStatus.includes("hoàn thành")) {
            status = OrderStatus.DELIVERED;
          } else if (rawStatus.includes("vận chuyển") || rawStatus.includes("van chuyen") || rawStatus.includes("giao hàng") || rawStatus.includes("dang giao")) {
            status = OrderStatus.SHIPPING;
          } else if (rawStatus.includes("xử lý") || rawStatus.includes("xu ly") || rawStatus.includes("chuẩn bị") || rawStatus.includes("chuan bi")) {
            status = OrderStatus.PROCESSING;
          } else if (rawStatus.includes("hủy") || rawStatus.includes("huy")) {
            status = OrderStatus.CANCELLED;
          } else {
            status = OrderStatus.AWAITING_PAYMENT;
          }

          // Cross reference with loadedUsers if order field is missing
          const matchingUser = loadedUsers.find(u => u.id === data.userId || (data.email && u.email === data.email));
          const customerPhone = data.phone || data.sdt || data.phoneNumber || data.recipientPhone || (matchingUser?.phone ? matchingUser.phone : "");
          const customerName = data.customerName || data.name || data.recipientName || data.fullName || (matchingUser?.name ? matchingUser.name : "Khách hàng");
          const customerAvatar = data.customerAvatar || data.avatar || (matchingUser?.avatar ? matchingUser.avatar : "https://lh3.googleusercontent.com/aida-public/AB6AXuAx0BytEzbLFBt7DZ-Usl9CoGOMmn3pka2w2C-VaTEzI0u9G5YDjLKH_k2SYEizcrJHowoz_uvob6rCujIkBm9_Il0bgp1yWsoaeWPAScV_-Ve4nNiMP3Ks4da4iIFLajJ48jmLkQ9e7Q09fBtq_RV8F7IBg-n31usB1gHlqxvAjEvoo0W8IC-UryWomSVJnCF8gzH2YwPvFdL5KaagiWtrQXngCpio2zGNGMEmhNKbL4c20Wfnpaf950gD4wfxNynPvx13KwqQXiM");
          const email = data.email || (matchingUser?.email ? matchingUser.email : "");

          const normalizeItem = (it: any, index: number): OrderItem => ({
            id: it.id || it.productId || it.cartItemId || `item-${index}`,
            sku: it.sku || it.productId || `SKU-${index + 1}`,
            name: it.name || it.productName || it.title || "Sản phẩm",
            size: it.size || it.variantSize || "",
            color: it.color || it.variantColor || "",
            quantity: Number(it.quantity || it.qty || 1),
            price: Number(it.price || 0),
            imageUrl: it.imageUrl || it.imgUrl || it.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200"
          });

          const rawItems = Array.isArray(data.items) ? data.items : [];
          const items = rawItems.map(normalizeItem);

          const rawReturnedItems = Array.isArray(data.returnedItems) ? data.returnedItems : [];
          const returnedItems = rawReturnedItems.map(normalizeItem);

          const subtotalCalculated = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
          const subtotal = data.subtotal ? Number(data.subtotal) : (subtotalCalculated > 0 ? subtotalCalculated : Number(data.total || 0));
          const shippingFee = Number(data.shippingFee || data.shipping || 0);
          const discountAmount = Number(data.discountAmount || data.discount || data.voucherDiscount || 0);
          const voucherCode = data.voucherCode || data.voucher || data.voucherApplied || "";
          const total = data.total ? Number(data.total) : (subtotal + shippingFee - discountAmount);

          return {
            id: docSnap.id,
            userId: data.userId || "",
            customerName,
            customerAvatar,
            email,
            phone: customerPhone,
            address: data.address || data.shippingAddress || "Tại cửa hàng",
            subtotal: subtotal,
            shippingFee: shippingFee,
            discountAmount: discountAmount,
            voucherCode: voucherCode,
            total: total,
            paymentMethod: data.paymentMethod || "COD",
            paymentEndingCard: "",
            status,
            date: createdDate.toLocaleDateString(),
            time: createdDate.toLocaleTimeString(),
            items: items,
            isReturnRequested: data.isReturnRequested || returnedItems.length > 0 || status === OrderStatus.REFUNDED,
            returnStatus: data.returnStatus || "",
            returnReason: data.returnReason || "",
            returnDescription: data.returnDescription || "",
            returnRefundAmount: data.returnRefundAmount || data.total || 0,
            returnImages: Array.isArray(data.returnImages) ? data.returnImages : [],
            returnedItems: returnedItems.length > 0 ? returnedItems : (status === OrderStatus.REFUNDED ? items : []),
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

    const unsubReturnedInventory = onSnapshot(collection(db, "returned_inventory"), (snapshot) => {
      const loadedReturnedItems: ReturnedInventoryItem[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          orderId: data.orderId || "",
          productId: data.productId || "",
          productName: data.productName || "Sản phẩm thu hồi",
          sku: data.sku || "",
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200",
          size: data.size || "",
          color: data.color || "",
          price: Number(data.price || 0),
          quantity: Number(data.quantity || 1),
          totalAmount: Number(data.totalAmount || (Number(data.price || 0) * Number(data.quantity || 1)) || 0),
          reason: data.reason || "Lỗi sản phẩm / Không đúng mô tả",
          description: data.description || "",
          proofImages: Array.isArray(data.proofImages) ? data.proofImages : [],
          customerName: data.customerName || "Khách hàng",
          customerPhone: data.customerPhone || "",
          returnedAt: data.returnedAt ? new Date(data.returnedAt).toLocaleString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          warehouseStatus: data.warehouseStatus || "LƯU_KHO_HANG_LOI",
          note: data.note || ""
        };
      });
      setReturnedInventory(loadedReturnedItems);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubUsers();
      unsubVouchers();
      unsubReturnedInventory();
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
      let targetRef = doc(db, "orders", orderId);
      let orderSnap = await getDoc(targetRef);

      // Nếu không tìm thấy bằng doc ID, tìm kiếm qua trường 'orderId'
      if (!orderSnap.exists()) {
        const cleanId = orderId.replace("#", "").trim();
        const q = query(collection(db, "orders"), where("orderId", "==", cleanId));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          orderSnap = querySnap.docs[0];
          targetRef = querySnap.docs[0].ref;
        }
      }

      if (!orderSnap.exists()) {
        alert("Không tìm thấy thông tin đơn hàng trên hệ thống!");
        return;
      }

      const orderData = orderSnap.data();
      const total = Number(orderData.total || 0);
      const shippingFee = Number(orderData.shippingFee || orderData.shipping || 0);
      const maxRefundAllowed = Math.max(0, total - shippingFee);
      
      let refundAmount = 0;
      if (orderData.returnRefundAmount !== undefined && orderData.returnRefundAmount !== null) {
        refundAmount = Number(orderData.returnRefundAmount);
      } else {
        // Fallback: Tiền hàng thực trừ phí ship (KHÔNG hoàn lại tiền ship)
        refundAmount = maxRefundAllowed;
      }

      // Khống chế số tiền hoàn tuyệt đối không bao gồm tiền ship
      refundAmount = Math.min(refundAmount, maxRefundAllowed);
      refundAmount = Math.max(0, refundAmount);

      // Xác định ID tài khoản người dùng nhận tiền hoàn
      let userId = orderData.userId;
      if (!userId) {
        const matchedUser = loadedUsers.find(u => 
          (orderData.phone && u.phone === orderData.phone) || 
          (orderData.email && u.email === orderData.email)
        );
        if (matchedUser) userId = matchedUser.id;
      }
      
      // 1. Hoàn tiền vào ví người dùng
      let walletUpdated = false;
      if (userId && refundAmount > 0) {
        try {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            walletBalance: increment(refundAmount)
          });
          walletUpdated = true;
        } catch (uErr: any) {
          console.warn("Could not update user wallet balance directly:", uErr);
        }

        // 2. Ghi nhận giao dịch hoàn tiền
        try {
          await addDoc(collection(db, "transactions"), {
            userId: userId,
            amount: refundAmount,
            type: "REFUND",
            description: `Hoàn tiền yêu cầu trả hàng cho đơn hàng #${orderId}`,
            timestamp: new Date().toISOString()
          });
        } catch (tErr: any) {
          console.warn("Could not record transaction:", tErr);
        }
      }
      
      // 3. LƯU VÀO KHO LƯU TRỮ HÀNG HOÀN / HÀNG LỖI (TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CỘNG VÀO KHO BÁN CHÍNH)
      const returnedItems = orderData.returnedItems || [];
      const reason = orderData.returnReason || "Lỗi sản phẩm / Không đúng mô tả";
      const returnDescription = orderData.returnDescription || "";
      const proofImages = orderData.returnImages || [];

      for (const item of returnedItems) {
        const productId = item.productId || item.cartItemId || item.id || "";
        let quantity = 0;
        if (typeof item.quantity === 'string') {
          try { quantity = parseInt(item.quantity, 10); } catch(e) {}
        } else {
          quantity = item.quantity || 1;
        }
        
        if (quantity > 0) {
          try {
            await addDoc(collection(db, "returned_inventory"), {
              orderId: orderId,
              productId: productId,
              productName: item.name || "Sản phẩm thu hồi",
              sku: item.sku || productId || "",
              imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200",
              size: item.size || "",
              color: item.color || "",
              price: Number(item.price || 0),
              quantity: quantity,
              totalAmount: Number(item.price || 0) * quantity,
              reason: reason,
              description: returnDescription,
              proofImages: proofImages,
              customerName: orderData.customerName || "Khách hàng",
              customerPhone: orderData.phone || "",
              returnedAt: new Date().toISOString(),
              warehouseStatus: "LƯU_KHO_HANG_LOI",
              note: `Hàng hoàn từ đơn #${orderId}`
            });
          } catch (retErr: any) {
            console.warn("Could not record to returned_inventory collection:", retErr);
          }
        }
      }

      // 4. Cập nhật trạng thái đơn hàng
      await updateDoc(targetRef, { 
        status: "Đã hoàn tiền",
        returnStatus: "APPROVED"
      });

      alert(`✅ Duyệt yêu cầu đổi trả thành công!\n` + 
            `• Đã hoàn ${refundAmount.toLocaleString('vi-VN')}₫ vào ví của khách hàng.\n` +
            `• Các sản phẩm hoàn trả đã được đưa vào [Kho Hàng Hoàn / Hàng Lỗi] (Không cộng vào kho bán chính).`);

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: OrderStatus.REFUND_COMPLETED, returnStatus: "APPROVED" });
      }
    } catch (e: any) {
      console.error("Error approving refund:", e);
      alert("Lỗi khi duyệt hoàn tiền: " + (e?.message || e));
    }
  };

  // Thao tác quản lý Kho Hàng Hoàn / Hàng Lỗi
  const handleRestockReturnedItem = async (item: ReturnedInventoryItem) => {
    if (!confirm(`Xác nhận sản phẩm "${item.productName}" (SL: ${item.quantity}) đạt chuẩn chất lượng và nhập lại vào Kho Bán Lẻ?`)) return;
    try {
      if (item.productId) {
        const prodRef = doc(db, "products", item.productId);
        await updateDoc(prodRef, {
          stock: increment(item.quantity)
        });
      }
      const itemRef = doc(db, "returned_inventory", item.id);
      await updateDoc(itemRef, {
        warehouseStatus: "NHAP_LAI_KHO_BAN",
        note: `Đã kiểm định và nhập lại kho bán lẻ lúc ${new Date().toLocaleString('vi-VN')}`
      });
      alert(`✅ Đã nhập lại ${item.quantity} sản phẩm vào kho bán lẻ thành công!`);
    } catch (e: any) {
      alert("Lỗi khi nhập kho bán: " + (e?.message || e));
    }
  };

  const handleDisposeReturnedItem = async (item: ReturnedInventoryItem) => {
    if (!confirm(`Xác nhận xuất hủy / tiêu hủy ${item.quantity} sản phẩm "${item.productName}" do bị lỗi hỏng/phế phẩm?`)) return;
    try {
      const itemRef = doc(db, "returned_inventory", item.id);
      await updateDoc(itemRef, {
        warehouseStatus: "DA_XUAT_HUY",
        note: `Đã xuất hủy lúc ${new Date().toLocaleString('vi-VN')}`
      });
      alert(`🗑️ Đã chuyển trạng thái xuất hủy phế phẩm thành công.`);
    } catch (e: any) {
      alert("Lỗi khi xuất hủy: " + (e?.message || e));
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

      case ActiveTab.RETURNS:
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
          <ReturnsView
            orders={resolvedOrders}
            returnedInventory={returnedInventory}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onApproveRefund={handleApproveRefund}
            onRestockItem={handleRestockReturnedItem}
            onDisposeItem={handleDisposeReturnedItem}
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

  const pendingReturnsCount = resolvedOrders.filter(o => 
    (o.isReturnRequested || o.status === OrderStatus.REFUNDED || (o.returnedItems && o.returnedItems.length > 0) || Boolean(o.returnReason)) &&
    o.status !== OrderStatus.REFUND_COMPLETED && o.returnStatus !== "APPROVED"
  ).length;

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
        returnCount={pendingReturnsCount}
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
