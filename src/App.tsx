/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActiveTab, Product, Category, User, Order, ProductStatus, UserTier, OrderStatus } from "./types";
import { 
  DEFAULT_PRODUCTS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_USERS, 
  DEFAULT_ORDERS,
  getStoredData,
  setStoredData
} from "./data";
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

export default function App() {
  // Navigation Routing States
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.DASHBOARD);
  const [searchText, setSearchText] = useState("");

  // Sandbox Local Databases (Persisted)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Focus and Active detail states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form rendering states (controls creation or update redirection)
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Initialize and register memory blocks
  useEffect(() => {
    const loadedProds = getStoredData<Product>("products", DEFAULT_PRODUCTS);
    const loadedCats = getStoredData<Category>("categories", DEFAULT_CATEGORIES);
    const loadedUsers = getStoredData<User>("users", DEFAULT_USERS);
    const loadedOrders = getStoredData<Order>("orders", DEFAULT_ORDERS);

    setProducts(loadedProds);
    setCategories(loadedCats);
    setUsers(loadedUsers);
    setOrders(loadedOrders);
  }, []);

  // Sync state helpers back to physical database
  const saveProductsToDb = (updated: Product[]) => {
    setProducts(updated);
    setStoredData("products", updated);
  };

  const saveCategoriesToDb = (updated: Category[]) => {
    setCategories(updated);
    setStoredData("categories", updated);
  };

  const saveUsersToDb = (updated: User[]) => {
    setUsers(updated);
    setStoredData("users", updated);
  };

  const saveOrdersToDb = (updated: Order[]) => {
    setOrders(updated);
    setStoredData("orders", updated);
  };

  // --- CRUD Actions for Products ---
  const handleSaveProduct = (payload: Partial<Product>) => {
    if (payload.id) {
      // EDIT mode
      const updated = products.map((p) => {
        if (p.id === payload.id) {
          return { ...p, ...payload } as Product;
        }
        return p;
      });
      saveProductsToDb(updated);
    } else {
      // ADD mode
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        sku: payload.sku || `TRN-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name || "Sản phẩm mới",
        description: payload.description || "Gợi mở mô tả sản phẩm...",
        categoryName: payload.categoryName || "Apparel",
        price: payload.price || 0,
        stock: payload.stock || 0,
        status: payload.status || ProductStatus.ACTIVE,
        imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
        lastModified: "Vừa xong"
      };
      const updated = [newProd, ...products];
      saveProductsToDb(updated);
      
      // Smart increment product count inside respective Category!
      const updatedCategories = categories.map((cat) => {
        if (cat.name === newProd.categoryName) {
          return { ...cat, productCount: cat.productCount + 1 };
        }
        return cat;
      });
      saveCategoriesToDb(updatedCategories);
    }

    // Reset view
    setEditingProduct(null);
    setIsAddingProduct(false);
    setActiveTab(ActiveTab.PRODUCTS);
  };

  const handleDeleteProduct = (productId: string) => {
    const pToDelete = products.find(p => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    saveProductsToDb(updated);

    // Smart decrement product count inside respective Category!
    if (pToDelete) {
      const updatedCategories = categories.map((cat) => {
        if (cat.name === pToDelete.categoryName && cat.productCount > 0) {
          return { ...cat, productCount: cat.productCount - 1 };
        }
        return cat;
      });
      saveCategoriesToDb(updatedCategories);
    }
  };

  // --- CRUD Actions for Categories ---
  const handleSaveCategory = (payload: Partial<Category>) => {
    if (payload.id) {
      // EDIT mode
      const updated = categories.map((cat) => {
        if (cat.id === payload.id) {
          return { ...cat, ...payload } as Category;
        }
        return cat;
      });
      saveCategoriesToDb(updated);
    } else {
      // ADD mode
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: payload.name || "Danh mục mới",
        description: payload.description || "",
        isLive: payload.isLive !== undefined ? payload.isLive : true,
        imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600",
        slug: payload.slug || "new-category",
        productCount: 0,
        lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        updatedBy: "Alexander Vane"
      };
      const updated = [...categories, newCat];
      saveCategoriesToDb(updated);
    }

    // Reset View
    setEditingCategory(null);
    setIsAddingCategory(false);
    setActiveTab(ActiveTab.CATEGORIES);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = categories.filter((cat) => cat.id !== categoryId);
    saveCategoriesToDb(updated);
  };

  const handleToggleLiveCategory = (categoryId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return { ...cat, isLive: !cat.isLive };
      }
      return cat;
    });
    saveCategoriesToDb(updated);
  };

  // --- User Operations ---
  const handleUpdateUserTier = (userId: string, newTier: UserTier) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, tier: newTier };
      }
      return u;
    });
    saveUsersToDb(updated);
  };

  // --- Order Operations ---
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        // Automatically sync system timeline highlights based on chosen status!
        const timeline = { ...order.timeline };
        const nowStr = `Thực tế lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
        
        if (newStatus === OrderStatus.SHIPPING) {
          timeline.shipping = { active: true, time: nowStr };
        } else if (newStatus === OrderStatus.DELIVERED) {
          timeline.shipping = { active: true, time: timeline.shipping.time || nowStr };
          timeline.delivered = { active: true, time: nowStr };
        } else if (newStatus === OrderStatus.PENDING) {
          timeline.shipping = { active: false, time: "Chờ lấy hàng" };
          timeline.delivered = { active: false, time: "Chờ cập nhật" };
        } else if (newStatus === OrderStatus.CANCELLED) {
          timeline.confirmed = { active: false, time: "Đơn đã hủy bỏ" };
          timeline.packing = { active: false, time: "Hủy duyệt" };
          timeline.shipping = { active: false, time: "-" };
          timeline.delivered = { active: false, time: "-" };
        }

        const updatedOrder = { ...order, status: newStatus, timeline };
        // Sync detail visualizer if active
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        return updatedOrder;
      }
      return order;
    });
    saveOrdersToDb(updated);
  };

  // Switch workspace layout context dynamically
  const renderActiveView = () => {
    switch (activeTab) {
      
      case ActiveTab.DASHBOARD:
        return (
          <DashboardView
            products={products}
            orders={orders}
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
          const catNames = categories.map(c => c.name);
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
          return (
            <OrderDetailView
              order={selectedOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onCancel={() => setSelectedOrder(null)}
            />
          );
        }
        return (
          <OrderListView
            orders={orders}
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
