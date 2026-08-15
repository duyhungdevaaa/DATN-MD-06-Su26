/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  CircleDollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Users, 
  Flame, 
  Crown, 
  BarChart3, 
  Calendar, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Eye, 
  MapPin, 
  Sliders
} from "lucide-react";
import { Product, Order, User } from "../types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface DashboardViewProps {
  products: Product[];
  orders: Order[];
  users: User[];
  onNavigateToTab?: (tab: any) => void;
  onSelectOrder?: (order: Order) => void;
}

type TimeFilterRange = "TODAY" | "7_DAYS" | "30_DAYS" | "THIS_MONTH" | "ALL" | "CUSTOM";
type ChartType = "BAR" | "AREA";
type ChartMetric = "REVENUE" | "ORDERS";

interface VariantItem {
  size: string;
  color: string;
  quantity: number;
  addQty?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  orders,
  users
}) => {
  // Filter States
  const [timeRange, setTimeRange] = useState<TimeFilterRange>("30_DAYS");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("REVENUE");
  const [chartType, setChartType] = useState<ChartType>("BAR");
  const [activeStockTab, setActiveStockTab] = useState<"ALL" | "OUT_OF_STOCK" | "CRITICAL">("ALL");
  const [productSearch, setProductSearch] = useState("");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Modal States
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockMode, setRestockMode] = useState<"ADD" | "SET">("ADD");
  const [modalVariants, setModalVariants] = useState<VariantItem[]>([]);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [stockSuccessToast, setStockSuccessToast] = useState<string | null>(null);

  const [orderDetailModal, setOrderDetailModal] = useState<Order | null>(null);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num || 0);
  };

  // Open Restock Modal
  const openRestockModal = (product: Product) => {
    setStockModalProduct(product);
    setRestockMode("ADD");
    setRestockAmount(10);

    if (product.variants && product.variants.length > 0) {
      setModalVariants(product.variants.map(v => ({ ...v, addQty: 0 })));
    } else if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      const sList = product.sizes && product.sizes.length > 0 ? product.sizes : ["Tiêu chuẩn"];
      const cList = product.colors && product.colors.length > 0 ? product.colors : ["Mặc định"];
      const generated: VariantItem[] = [];
      sList.forEach(s => {
        cList.forEach(c => {
          generated.push({ size: s, color: c, quantity: 0, addQty: 0 });
        });
      });
      setModalVariants(generated);
    } else {
      setModalVariants([]);
    }
  };

  const parseOrderDate = (dateStr: string): Date | null => {
    try {
      if (!dateStr) return null;
      const part = dateStr.split(" ")[0];
      if (part.includes("/")) {
        const [d, m, y] = part.split("/");
        return new Date(Number(y), Number(m) - 1, Number(d));
      } else if (part.includes("-")) {
        const [y, m, d] = part.split("-");
        return new Date(Number(y), Number(m) - 1, Number(d));
      }
      const d = new Date(part);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  // Filter orders according to TimeRange
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return orders.filter(order => {
      const orderDate = parseOrderDate(order.date);
      if (!orderDate) return true;
      const orderTime = orderDate.getTime();

      if (timeRange === "TODAY") return orderTime >= todayStart;
      if (timeRange === "7_DAYS") return orderTime >= (todayStart - 7 * 86400000);
      if (timeRange === "30_DAYS") return orderTime >= (todayStart - 30 * 86400000);
      if (timeRange === "THIS_MONTH") return orderTime >= new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      if (timeRange === "CUSTOM") {
        const sTime = startDate ? new Date(startDate).getTime() : 0;
        const eTime = endDate ? new Date(endDate).getTime() + 86400000 : Infinity;
        return orderTime >= sTime && orderTime <= eTime;
      }
      return true;
    });
  }, [orders, timeRange, startDate, endDate]);

  // Core KPI Calculations
  const validOrders = filteredOrders.filter(o => o.status !== "Đã hủy" && o.status !== "Trả hàng/Hoàn tiền" && o.status !== "Đã hoàn tiền");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const successfulOrdersCount = filteredOrders.filter(o => o.status === "Đã giao hàng").length;
  const cancelledOrdersCount = filteredOrders.filter(o => o.status === "Đã hủy").length;
  const returnedOrdersCount = filteredOrders.filter(o => o.status === "Trả hàng/Hoàn tiền" || o.status === "Đã hoàn tiền" || o.isReturnRequested).length;
  const pendingOrdersCount = filteredOrders.filter(o => o.status === "Chờ xác nhận" || o.status === "Đang xử lý").length;
  const shippingOrdersCount = filteredOrders.filter(o => o.status === "Đang giao hàng").length;

  const averageOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  const cancellationRate = totalOrdersCount > 0 ? ((cancelledOrdersCount / totalOrdersCount) * 100).toFixed(1) : "0.0";
  const returnRate = totalOrdersCount > 0 ? ((returnedOrdersCount / totalOrdersCount) * 100).toFixed(1) : "0.0";

  // Stock Analysis
  const outOfStockProducts = useMemo(() => products.filter(p => (p.stock || 0) <= 0), [products]);
  const criticalStockProducts = useMemo(() => products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5), [products]);
  const lowStockProducts = useMemo(() => products.filter(p => (p.stock || 0) > 5 && (p.stock || 0) <= 15), [products]);
  const allWarningStockProducts = useMemo(() => products.filter(p => (p.stock || 0) <= 15), [products]);

  // Top Selling Products
  const topSellingProducts = useMemo(() => {
    const salesMap = new Map<string, { product: Product | null; name: string; imageUrl: string; sku: string; categoryName: string; unitsSold: number; revenue: number; currentStock: number; hasVariants: boolean }>();

    validOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const prodId = item.id || item.sku || item.name;
        const matchingProduct = products.find(p => p.id === item.id || p.sku === item.sku || p.name === item.name) || null;
        const qty = item.quantity || 1;
        const rev = (item.price || 0) * qty;

        if (salesMap.has(prodId)) {
          const prev = salesMap.get(prodId)!;
          prev.unitsSold += qty;
          prev.revenue += rev;
        } else {
          salesMap.set(prodId, {
            product: matchingProduct,
            name: item.name || matchingProduct?.name || "Sản phẩm",
            imageUrl: item.imageUrl || matchingProduct?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
            sku: item.sku || matchingProduct?.sku || "SKU-N/A",
            categoryName: matchingProduct?.categoryName || "Thời trang",
            unitsSold: qty,
            revenue: rev,
            currentStock: matchingProduct ? matchingProduct.stock : 0,
            hasVariants: !!(matchingProduct?.variants && matchingProduct.variants.length > 0)
          });
        }
      });
    });

    const sorted = Array.from(salesMap.values()).sort((a, b) => b.unitsSold - a.unitsSold);
    
    if (sorted.length === 0 && products.length > 0) {
      return products.slice(0, 5).map((p, idx) => ({
        product: p,
        name: p.name,
        imageUrl: p.imageUrl,
        sku: p.sku,
        categoryName: p.categoryName,
        unitsSold: Math.max(10 - idx * 2, 1),
        revenue: p.price * Math.max(10 - idx * 2, 1),
        currentStock: p.stock,
        hasVariants: !!(p.variants && p.variants.length > 0)
      }));
    }
    return sorted;
  }, [validOrders, products]);

  const maxTopSold = Math.max(...topSellingProducts.map(p => p.unitsSold), 1);

  // Category Revenue Distribution
  const categoryRevenue = useMemo(() => {
    const catMap = new Map<string, { count: number; revenue: number }>();
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const prod = products.find(p => p.id === item.id || p.name === item.name);
        const cat = prod?.categoryName || "Khác";
        const rev = (item.price || 0) * (item.quantity || 1);
        if (catMap.has(cat)) {
          const c = catMap.get(cat)!;
          c.count += (item.quantity || 1);
          c.revenue += rev;
        } else {
          catMap.set(cat, { count: item.quantity || 1, revenue: rev });
        }
      });
    });
    return Array.from(catMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [validOrders, products]);

  // Weekly Revenue & Orders
  const weeklyDays = useMemo(() => {
    const days = [
      { label: "T2", fullName: "Thứ Hai", revenue: 0, orders: 0 },
      { label: "T3", fullName: "Thứ Ba", revenue: 0, orders: 0 },
      { label: "T4", fullName: "Thứ Tư", revenue: 0, orders: 0 },
      { label: "T5", fullName: "Thứ Năm", revenue: 0, orders: 0 },
      { label: "T6", fullName: "Thứ Sáu", revenue: 0, orders: 0 },
      { label: "T7", fullName: "Thứ Bảy", revenue: 0, orders: 0 },
      { label: "CN", fullName: "Chủ Nhật", revenue: 0, orders: 0 }
    ];

    filteredOrders.forEach(o => {
      const d = parseOrderDate(o.date);
      if (d) {
        let dayIdx = d.getDay();
        const mapIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        if (days[mapIdx]) {
          days[mapIdx].orders += 1;
          if (o.status !== "Đã hủy" && o.status !== "Trả hàng/Hoàn tiền" && o.status !== "Đã hoàn tiền") {
            days[mapIdx].revenue += (o.total || 0);
          }
        }
      }
    });
    return days;
  }, [filteredOrders]);

  // Scale for Y Axis
  const rawMax = useMemo(() => {
    if (chartMetric === "REVENUE") {
      return Math.max(...weeklyDays.map(d => d.revenue), 1_000_000);
    }
    return Math.max(...weeklyDays.map(d => d.orders), 4);
  }, [weeklyDays, chartMetric]);

  const niceMax = useMemo(() => {
    if (chartMetric === "REVENUE") {
      if (rawMax <= 2_000_000) return 2_000_000;
      if (rawMax <= 5_000_000) return 5_000_000;
      if (rawMax <= 10_000_000) return 10_000_000;
      if (rawMax <= 15_000_000) return 15_000_000;
      if (rawMax <= 20_000_000) return 20_000_000;
      if (rawMax <= 30_000_000) return 30_000_000;
      if (rawMax <= 50_000_000) return 50_000_000;
      return Math.ceil(rawMax / 10_000_000) * 10_000_000;
    } else {
      if (rawMax <= 5) return 5;
      if (rawMax <= 10) return 10;
      if (rawMax <= 20) return 20;
      return Math.ceil(rawMax / 10) * 10;
    }
  }, [rawMax, chartMetric]);

  const formatYLabel = (val: number) => {
    if (chartMetric === "REVENUE") {
      if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1).replace(".0", "") + " Tỷ";
      if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(".0", "") + " Tr";
      if (val >= 1_000) return (val / 1_000).toFixed(0) + "K";
      return val.toString();
    }
    return val.toString();
  };

  // Top VIP Customers
  const topCustomers = useMemo(() => {
    const custMap = new Map<string, { name: string; email: string; avatar: string; orderCount: number; totalSpent: number }>();
    validOrders.forEach(o => {
      const key = o.email || o.customerName || o.userId || "Khách lẻ";
      const total = o.total || 0;
      if (custMap.has(key)) {
        const c = custMap.get(key)!;
        c.orderCount += 1;
        c.totalSpent += total;
      } else {
        custMap.set(key, {
          name: o.customerName || "Khách hàng",
          email: o.email || "",
          avatar: o.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.customerName || "U")}&background=0D8ABC&color=fff`,
          orderCount: 1,
          totalSpent: total
        });
      }
    });
    return Array.from(custMap.values()).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [validOrders]);

  // Filtered warning stock list
  const filteredWarningStock = useMemo(() => {
    let list = allWarningStockProducts;
    if (activeStockTab === "OUT_OF_STOCK") list = outOfStockProducts;
    else if (activeStockTab === "CRITICAL") list = criticalStockProducts;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q));
    }
    return list;
  }, [allWarningStockProducts, activeStockTab, outOfStockProducts, criticalStockProducts, productSearch]);

  // Handle in-place stock update
  const handleUpdateStock = async () => {
    if (!stockModalProduct) return;
    setIsUpdatingStock(true);
    try {
      const productRef = doc(db, "products", stockModalProduct.id);

      if (modalVariants.length > 0) {
        const updatedVariants = modalVariants.map(v => {
          let newQty = v.quantity;
          if (restockMode === "ADD") {
            newQty = Math.max(0, (v.quantity || 0) + (v.addQty || 0));
          } else {
            newQty = Math.max(0, v.addQty !== undefined ? v.addQty : v.quantity);
          }
          return { size: v.size, color: v.color, quantity: newQty };
        });

        const totalStock = updatedVariants.reduce((sum, v) => sum + v.quantity, 0);

        await updateDoc(productRef, {
          variants: updatedVariants,
          stock: totalStock,
          lastModified: new Date().toISOString()
        });

        stockModalProduct.variants = updatedVariants;
        stockModalProduct.stock = totalStock;
        setStockSuccessToast(`Đã cập nhật tồn kho: ${totalStock} sản phẩm`);
      } else {
        const currentStock = stockModalProduct.stock || 0;
        let newStock = restockMode === "ADD" ? currentStock + Number(restockAmount) : Number(restockAmount);
        if (newStock < 0) newStock = 0;

        await updateDoc(productRef, {
          stock: newStock,
          lastModified: new Date().toISOString()
        });

        stockModalProduct.stock = newStock;
        setStockSuccessToast(`Đã cập nhật tồn kho: ${newStock} sản phẩm`);
      }

      setTimeout(() => setStockSuccessToast(null), 3000);
      setStockModalProduct(null);
    } catch (err: any) {
      alert("Lỗi cập nhật tồn kho: " + err.message);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleBulkApplyVariants = (amount: number) => {
    setModalVariants(prev => prev.map(v => ({ ...v, addQty: amount })));
  };

  const svgWidth = 620;
  const svgHeight = 200;
  const chartTop = 20;
  const chartBottom = 160;
  const chartPlotHeight = chartBottom - chartTop;
  const xCoords = [60, 145, 230, 315, 400, 485, 570];
  const barWidth = 24;

  const points = weeklyDays.map((d, i) => {
    const val = chartMetric === "REVENUE" ? d.revenue : d.orders;
    const y = chartBottom - (val / niceMax) * chartPlotHeight;
    return { x: xCoords[i], y, val, data: d };
  });

  const areaPathD = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    const linePath = d;
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;
    return { linePath, areaPath };
  }, [points, chartBottom]);

  const totalVariantStockAfter = useMemo(() => {
    if (modalVariants.length === 0) return 0;
    return modalVariants.reduce((sum, v) => {
      if (restockMode === "ADD") return sum + Math.max(0, (v.quantity || 0) + (v.addQty || 0));
      return sum + Math.max(0, v.addQty !== undefined ? v.addQty : v.quantity);
    }, 0);
  }, [modalVariants, restockMode]);

  return (
    <div className="space-y-6 font-sans text-left pb-16">
      
      {/* Toast Alert */}
      {stockSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{stockSuccessToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER & TIME FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">Tổng quan kinh doanh</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Trực tuyến
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 text-xs font-semibold text-zinc-600">
            <button
              onClick={() => setTimeRange("TODAY")}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === "TODAY" ? "bg-white text-zinc-900 shadow-xs font-bold" : "hover:text-zinc-900"}`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeRange("7_DAYS")}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === "7_DAYS" ? "bg-white text-zinc-900 shadow-xs font-bold" : "hover:text-zinc-900"}`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeRange("30_DAYS")}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === "30_DAYS" ? "bg-white text-zinc-900 shadow-xs font-bold" : "hover:text-zinc-900"}`}
            >
              30 ngày
            </button>
            <button
              onClick={() => setTimeRange("THIS_MONTH")}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === "THIS_MONTH" ? "bg-white text-zinc-900 shadow-xs font-bold" : "hover:text-zinc-900"}`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeRange("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === "ALL" ? "bg-white text-zinc-900 shadow-xs font-bold" : "hover:text-zinc-900"}`}
            >
              Tất cả
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200/80 rounded-xl px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setTimeRange("CUSTOM"); }}
              className="bg-transparent text-zinc-700 outline-none text-xs"
            />
            <span className="text-zinc-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setTimeRange("CUSTOM"); }}
              className="bg-transparent text-zinc-700 outline-none text-xs"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(""); setEndDate(""); setTimeRange("30_DAYS"); }}
                className="text-[11px] text-rose-600 font-bold hover:underline ml-1"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CORE KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Doanh thu thuần</p>
              <p className="text-2xl font-black text-zinc-900 mt-1 tracking-tight">{formatVND(totalRevenue)}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-medium">Giá trị TB/Đơn (AOV):</span>
            <span className="font-bold text-zinc-900">{formatVND(averageOrderValue)}</span>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tổng số đơn hàng</p>
              <p className="text-2xl font-black text-zinc-900 mt-1 tracking-tight">{totalOrdersCount} <span className="text-sm font-semibold text-zinc-500">đơn</span></p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-700 font-bold">{pendingOrdersCount} chờ xử lý</span>
            <span className="text-emerald-700 font-bold">• {successfulOrdersCount} đã giao</span>
          </div>
        </div>

        {/* Metric 3: Stock */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Mặt hàng tồn kho</p>
              <p className="text-2xl font-black text-zinc-900 mt-1 tracking-tight">{products.length} <span className="text-sm font-semibold text-zinc-500">mã SKU</span></p>
            </div>
            <div className={`p-3 rounded-xl border ${outOfStockProducts.length > 0 ? "bg-rose-50 text-rose-700 border-rose-200/60" : "bg-sky-50 text-sky-700 border-sky-200/60"}`}>
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className={outOfStockProducts.length > 0 ? "text-rose-600 font-bold" : "text-zinc-500"}>
              {outOfStockProducts.length > 0 ? `${outOfStockProducts.length} mã hết hàng` : "Đầy đủ hàng"}
            </span>
            <span className="text-amber-700 font-bold">{criticalStockProducts.length} sắp hết</span>
          </div>
        </div>

        {/* Metric 4: Users */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tổng khách hàng</p>
              <p className="text-2xl font-black text-zinc-900 mt-1 tracking-tight">{users.length} <span className="text-sm font-semibold text-zinc-500">tài khoản</span></p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-medium">Hủy: <b className="text-zinc-800">{cancellationRate}%</b></span>
            <span className="text-zinc-500 font-medium">Hoàn: <b className="text-zinc-800">{returnRate}%</b></span>
          </div>
        </div>

      </div>

      {/* 3. REVENUE CHART + ORDER STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-zinc-800" />
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Xu hướng Doanh thu & Đơn hàng</h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 text-xs font-semibold">
                <button
                  onClick={() => setChartMetric("REVENUE")}
                  className={`px-3 py-1 rounded-lg transition-all ${chartMetric === "REVENUE" ? "bg-zinc-900 text-white shadow-xs font-bold" : "text-zinc-600 hover:text-zinc-900"}`}
                >
                  Doanh thu
                </button>
                <button
                  onClick={() => setChartMetric("ORDERS")}
                  className={`px-3 py-1 rounded-lg transition-all ${chartMetric === "ORDERS" ? "bg-zinc-900 text-white shadow-xs font-bold" : "text-zinc-600 hover:text-zinc-900"}`}
                >
                  Đơn hàng
                </button>
              </div>

              <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 text-xs font-semibold">
                <button
                  onClick={() => setChartType("BAR")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${chartType === "BAR" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  Cột
                </button>
                <button
                  onClick={() => setChartType("AREA")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${chartType === "AREA" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  Đường
                </button>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="h-60 w-full pt-2 relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EE4D2D" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#EE4D2D" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#3f3f46" />
                </linearGradient>
                <linearGradient id="peakBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EE4D2D" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.333, 0.666, 1].map((ratio, idx) => {
                const y = chartBottom - ratio * chartPlotHeight;
                const labelVal = Math.round(niceMax * ratio);
                return (
                  <g key={idx}>
                    <line x1="45" y1={y} x2={svgWidth - 10} y2={y} stroke={idx === 0 ? "#e4e4e7" : "#f4f4f5"} strokeWidth={idx === 0 ? "1.5" : "1"} strokeDasharray={idx === 0 ? "none" : "4,4"} />
                    <text x="35" y={y + 3.5} textAnchor="end" className="text-[10px] fill-zinc-400 font-semibold font-mono">
                      {formatYLabel(labelVal)}
                    </text>
                  </g>
                );
              })}

              {/* Area Mode */}
              {chartType === "AREA" && (
                <>
                  <path d={typeof areaPathD === "object" ? areaPathD.areaPath : ""} fill="url(#areaGradient)" />
                  <path d={typeof areaPathD === "object" ? areaPathD.linePath : ""} fill="none" stroke="#EE4D2D" strokeWidth="2.5" strokeLinecap="round" />
                  {points.map((p, idx) => (
                    <g key={idx} onMouseEnter={() => setHoveredDayIndex(idx)} onMouseLeave={() => setHoveredDayIndex(null)} className="cursor-pointer">
                      <circle cx={p.x} cy={p.y} r={hoveredDayIndex === idx ? "6" : "4"} fill="#ffffff" stroke="#EE4D2D" strokeWidth="2.5" />
                      <text x={p.x} y={chartBottom + 20} textAnchor="middle" className={`text-[11px] font-bold ${hoveredDayIndex === idx ? "fill-[#EE4D2D]" : "fill-zinc-600"}`}>
                        {p.data.label}
                      </text>
                    </g>
                  ))}
                </>
              )}

              {/* Bar Mode */}
              {chartType === "BAR" && (
                <>
                  {weeklyDays.map((d, idx) => {
                    const curVal = chartMetric === "REVENUE" ? d.revenue : d.orders;
                    const barH = niceMax > 0 ? (curVal / niceMax) * chartPlotHeight : 0;
                    const xPos = xCoords[idx];
                    const yPos = chartBottom - barH;
                    const isPeak = curVal === Math.max(...weeklyDays.map(item => chartMetric === "REVENUE" ? item.revenue : item.orders)) && curVal > 0;
                    const isHovered = hoveredDayIndex === idx;

                    return (
                      <g key={idx} onMouseEnter={() => setHoveredDayIndex(idx)} onMouseLeave={() => setHoveredDayIndex(null)} className="cursor-pointer">
                        <rect x={xPos - 30} y={chartTop} width="60" height={chartPlotHeight + 25} fill="transparent" />
                        {barH > 0 && (
                          <rect 
                            x={xPos - barWidth / 2} 
                            y={yPos} 
                            width={barWidth} 
                            height={barH} 
                            fill={isPeak ? "url(#peakBarGradient)" : isHovered ? "#27272a" : "url(#barGradient)"} 
                            rx="5" 
                            ry="5"
                          />
                        )}
                        <text x={xPos} y={chartBottom + 20} textAnchor="middle" className={`text-[11px] font-bold ${isHovered ? "fill-[#EE4D2D]" : "fill-zinc-600"}`}>
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {hoveredDayIndex !== null && (
              <div 
                className="absolute top-2 bg-zinc-900 text-white px-3 py-2 rounded-xl shadow-xl border border-zinc-700 text-xs pointer-events-none transition-all duration-150 z-20"
                style={{ left: `${(xCoords[hoveredDayIndex] / svgWidth) * 100}%`, transform: "translateX(-50%)" }}
              >
                <p className="font-bold text-zinc-300 text-[11px] mb-1">{weeklyDays[hoveredDayIndex].fullName}</p>
                <div className="space-y-0.5 text-[11px]">
                  <p className="text-emerald-400 font-bold">Doanh thu: {formatVND(weeklyDays[hoveredDayIndex].revenue)}</p>
                  <p className="text-zinc-300">Đơn hàng: {weeklyDays[hoveredDayIndex].orders} đơn</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-zinc-100 text-xs text-zinc-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-zinc-900" /> Ngày thường</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#EE4D2D]" /> Cao điểm</span>
            </div>
            <span className="font-semibold text-zinc-800">Tổng kỳ: <b>{formatVND(totalRevenue)}</b></span>
          </div>
        </div>

        {/* Right 1 Col: Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Trạng thái đơn hàng</h3>
            <span className="text-xs font-bold text-zinc-500">{totalOrdersCount} đơn</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-amber-800 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" /> Chờ xử lý
                </span>
                <span className="text-zinc-700 font-bold">{pendingOrdersCount} ({totalOrdersCount > 0 ? Math.round((pendingOrdersCount / totalOrdersCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalOrdersCount > 0 ? (pendingOrdersCount / totalOrdersCount) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-sky-800 font-semibold flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-sky-600" /> Đang giao
                </span>
                <span className="text-zinc-700 font-bold">{shippingOrdersCount} ({totalOrdersCount > 0 ? Math.round((shippingOrdersCount / totalOrdersCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${totalOrdersCount > 0 ? (shippingOrdersCount / totalOrdersCount) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã giao
                </span>
                <span className="text-zinc-700 font-bold">{successfulOrdersCount} ({totalOrdersCount > 0 ? Math.round((successfulOrdersCount / totalOrdersCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalOrdersCount > 0 ? (successfulOrdersCount / totalOrdersCount) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-rose-800 font-semibold flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-rose-600" /> Hủy / Hoàn tiền
                </span>
                <span className="text-zinc-700 font-bold">{cancelledOrdersCount + returnedOrdersCount} ({totalOrdersCount > 0 ? Math.round(((cancelledOrdersCount + returnedOrdersCount) / totalOrdersCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${totalOrdersCount > 0 ? ((cancelledOrdersCount + returnedOrdersCount) / totalOrdersCount) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">Doanh số theo ngành hàng</h4>
            <div className="space-y-2">
              {categoryRevenue.slice(0, 3).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 font-medium truncate max-w-[130px]">{cat.name}</span>
                  <span className="font-bold text-zinc-900">{formatVND(cat.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 4. TOP SẢN PHẨM BÁN CHẠY NHẤT */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
            <Flame className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Top sản phẩm bán chạy</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Hạng</th>
                <th className="py-3 px-4 min-w-[220px]">Sản phẩm</th>
                <th className="py-3 px-4">Ngành hàng</th>
                <th className="py-3 px-4 text-center">Đã bán</th>
                <th className="py-3 px-4 min-w-[140px]">Tỷ lệ bán</th>
                <th className="py-3 px-4 text-right">Doanh thu</th>
                <th className="py-3 px-4 text-center">Tồn kho</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {topSellingProducts.slice(0, 6).map((item, index) => {
                const percentSold = Math.round((item.unitsSold / maxTopSold) * 100);
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <tr key={index} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      {isTop1 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs border border-amber-300">🥇 1</span>}
                      {isTop2 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black text-xs border border-slate-300">🥈 2</span>}
                      {isTop3 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 font-black text-xs border border-amber-200">🥉 3</span>}
                      {!isTop1 && !isTop2 && !isTop3 && <span className="font-bold text-zinc-500 text-xs">#{index + 1}</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-11 h-11 rounded-lg object-cover border border-zinc-200 shrink-0" 
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; }}
                        />
                        <div>
                          <p className="font-bold text-zinc-900 line-clamp-1">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-zinc-400 font-mono">SKU: {item.sku}</span>
                            {item.hasVariants && <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded">Phân loại</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium text-[11px]">
                        {item.categoryName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-zinc-900 text-sm">{item.unitsSold}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-full">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                          <span>{percentSold}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isTop1 ? "bg-[#EE4D2D]" : isTop2 ? "bg-amber-500" : "bg-zinc-800"}`} 
                            style={{ width: `${percentSold}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-zinc-900 text-sm">{formatVND(item.revenue)}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.currentStock <= 0 ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Hết hàng</span>
                      ) : item.currentStock <= 5 ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Còn {item.currentStock}</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Còn {item.currentStock}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.product && (
                        <button
                          onClick={() => openRestockModal(item.product!)}
                          className="px-2.5 py-1 text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Nhập kho
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CẢNH BÁO TỒN KHO & TOP KHÁCH HÀNG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Low Stock */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Cảnh báo tồn kho</h3>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveStockTab("ALL")}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeStockTab === "ALL" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                Tất cả ({allWarningStockProducts.length})
              </button>
              <button
                onClick={() => setActiveStockTab("OUT_OF_STOCK")}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeStockTab === "OUT_OF_STOCK" ? "bg-rose-600 text-white shadow-xs font-bold" : "text-rose-700 hover:text-rose-900"}`}
              >
                Hết hàng ({outOfStockProducts.length})
              </button>
              <button
                onClick={() => setActiveStockTab("CRITICAL")}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeStockTab === "CRITICAL" ? "bg-amber-600 text-white shadow-xs font-bold" : "text-amber-700 hover:text-amber-900"}`}
              >
                Nguy cấp ({criticalStockProducts.length})
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Tìm theo tên sản phẩm, SKU hoặc danh mục..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-zinc-200 outline-none focus:border-zinc-900 bg-zinc-50/50"
            />
          </div>

          {filteredWarningStock.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              Tất cả các sản phẩm đang có số lượng tồn kho an toàn!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredWarningStock.slice(0, 6).map((prod) => {
                const isOutOfStock = (prod.stock || 0) <= 0;
                const isCritical = (prod.stock || 0) > 0 && (prod.stock || 0) <= 5;
                const hasVariants = !!(prod.variants && prod.variants.length > 0);

                return (
                  <div 
                    key={prod.id} 
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isOutOfStock ? "bg-rose-50/50 border-rose-200" : isCritical ? "bg-amber-50/50 border-amber-200" : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0" 
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{prod.name}</p>
                        <p className="text-[11px] text-zinc-500">{formatVND(prod.price)} • {prod.categoryName}</p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isOutOfStock ? "bg-rose-100 text-rose-800" : isCritical ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"
                          }`}>
                            {isOutOfStock ? "HẾT HÀNG (0 SP)" : `CÒN ${prod.stock} SP`}
                          </span>
                          {hasVariants && (
                            <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                              {prod.variants!.length} phân loại
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => openRestockModal(prod)}
                      className="text-xs font-bold text-white bg-zinc-900 hover:bg-black px-3 py-1.5 rounded-xl shrink-0 shadow-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nhập kho
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: VIP Customers */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Khách hàng chi tiêu cao nhất</h3>
          </div>

          <div className="space-y-3">
            {topCustomers.map((cust, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={cust.avatar} alt={cust.name} className="w-9 h-9 rounded-full object-cover border border-zinc-200" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">{cust.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{cust.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-zinc-900">{formatVND(cust.totalSpent)}</p>
                  <span className="text-[10px] text-zinc-400 font-medium">{cust.orderCount} đơn</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 6. ĐƠN HÀNG GẦN ĐÂY */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Đơn hàng gần đây</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-center">Số món</th>
                <th className="py-3 px-4">Phương thức</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.slice(0, 6).map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={order.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customerName || "U")}&background=0D8ABC&color=fff`} 
                        alt={order.customerName}
                        className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                      />
                      <div>
                        <p className="font-bold text-zinc-900 line-clamp-1">{order.customerName}</p>
                        <p className="text-[10px] text-zinc-400">{order.phone || order.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600 font-medium">
                    {order.date} {order.time}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-zinc-700">
                    {order.items.length}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                      {order.paymentMethod || "COD"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-zinc-900 text-sm">
                    {formatVND(order.total)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                      order.status === "Chờ xác nhận" || order.status === "Đang xử lý"
                        ? "bg-amber-50 text-amber-700 border border-amber-200/60" 
                        : order.status === "Đang giao hàng" 
                        ? "bg-sky-50 text-sky-700 border border-sky-200/60" 
                        : order.status === "Đã hủy"
                        ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                        : order.status === "Trả hàng/Hoàn tiền" || order.status === "Đã hoàn tiền"
                        ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button 
                      onClick={() => setOrderDetailModal(order)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NHẬP KHO */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-zinc-800" />
                <h3 className="font-bold text-zinc-900 text-sm">Nhập kho sản phẩm</h3>
              </div>
              <button onClick={() => setStockModalProduct(null)} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <img 
                  src={stockModalProduct.imageUrl} 
                  alt={stockModalProduct.name}
                  className="w-14 h-14 rounded-lg object-cover border border-zinc-200 shrink-0" 
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; }}
                />
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 text-xs line-clamp-1">{stockModalProduct.name}</p>
                  <p className="text-[11px] text-zinc-500 font-mono">SKU: {stockModalProduct.sku}</p>
                  <p className="text-xs font-bold text-[#EE4D2D] mt-0.5">{formatVND(stockModalProduct.price)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100/70 border border-zinc-200/60">
                <span className="text-xs text-zinc-600 font-medium">Tồn kho hiện tại:</span>
                <span className="text-sm font-extrabold text-zinc-900">{stockModalProduct.stock || 0} sản phẩm</span>
              </div>

              <div className="flex items-center p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRestockMode("ADD")}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${restockMode === "ADD" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-600 hover:text-zinc-900"}`}
                >
                  + Nhập thêm vào kho
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRestockMode("SET");
                    if (modalVariants.length > 0) {
                      setModalVariants(prev => prev.map(v => ({ ...v, addQty: v.quantity })));
                    } else {
                      setRestockAmount(stockModalProduct.stock || 0);
                    }
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${restockMode === "SET" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-600 hover:text-zinc-900"}`}
                >
                  = Đặt lại tổng số tồn
                </button>
              </div>

              {modalVariants.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {restockMode === "ADD" && (
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                        Điền nhanh cho tất cả:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[5, 10, 20, 50, 100].map(qty => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => handleBulkApplyVariants(qty)}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors"
                          >
                            +{qty}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200">
                          <th className="py-2.5 px-3">Phân loại (Size / Màu)</th>
                          <th className="py-2.5 px-3 text-center">Tồn hiện tại</th>
                          <th className="py-2.5 px-3 text-center w-36">{restockMode === "ADD" ? "Nhập thêm (+)" : "Tồn mới (=)"}</th>
                          <th className="py-2.5 px-3 text-right">Tồn sau nhập</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {modalVariants.map((variant, vIdx) => {
                          const currentQty = variant.quantity || 0;
                          const addQty = variant.addQty || 0;
                          const finalQty = restockMode === "ADD" ? Math.max(0, currentQty + addQty) : Math.max(0, addQty);

                          return (
                            <tr key={vIdx} className="hover:bg-zinc-50/70">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-bold text-[11px]">Size {variant.size}</span>
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium text-[11px]">{variant.color}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold text-zinc-600">{currentQty}</td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextVal = Math.max(0, (variant.addQty || 0) - 1);
                                      setModalVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, addQty: nextVal } : item));
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                                  >
                                    -
                                  </button>
                                  <input 
                                    type="number" 
                                    min="0"
                                    value={variant.addQty === undefined ? 0 : variant.addQty}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setModalVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, addQty: val } : item));
                                    }}
                                    className="w-14 text-center font-bold py-1 border border-zinc-200 rounded-md outline-none focus:border-zinc-900 bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextVal = (variant.addQty || 0) + 1;
                                      setModalVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, addQty: nextVal } : item));
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{finalQty} sp</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-medium">Tổng tồn kho sau khi lưu:</span>
                    <span className="text-emerald-950 font-black text-sm">{totalVariantStockAfter} sản phẩm</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">
                      {restockMode === "ADD" ? "Số lượng nhập thêm:" : "Số lượng tồn kho mới:"}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRestockAmount(Math.max(0, Number(restockAmount) - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input 
                        type="number" 
                        min="0"
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 text-center font-bold text-base py-2 rounded-xl border border-zinc-200 outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => setRestockAmount(Number(restockAmount) + 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {restockMode === "ADD" && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-zinc-400 font-medium">Nhanh:</span>
                      {[5, 10, 20, 50, 100].map(qty => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setRestockAmount(qty)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            restockAmount === qty ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          +{qty}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-medium">Tồn sau khi lưu:</span>
                    <span className="text-emerald-950 font-black text-sm">
                      {restockMode === "ADD" ? (stockModalProduct.stock || 0) + Number(restockAmount) : Number(restockAmount)} sản phẩm
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 flex items-center justify-end gap-2 bg-zinc-50/50">
              <button type="button" onClick={() => setStockModalProduct(null)} className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
                Hủy
              </button>
              <button
                type="button"
                disabled={isUpdatingStock}
                onClick={handleUpdateStock}
                className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdatingStock ? "Đang lưu..." : "Cập nhật tồn kho"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {orderDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-800" />
                <h3 className="font-bold text-zinc-900 text-sm">Đơn hàng #{orderDetailModal.id.substring(0, 8)}</h3>
              </div>
              <button onClick={() => setOrderDetailModal(null)} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-3">
                  <img 
                    src={orderDetailModal.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(orderDetailModal.customerName || "U")}&background=0D8ABC&color=fff`} 
                    alt={orderDetailModal.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                  />
                  <div>
                    <p className="font-bold text-zinc-900 text-xs">{orderDetailModal.customerName}</p>
                    <p className="text-zinc-500">{orderDetailModal.phone || "Không có SĐT"} • {orderDetailModal.email || ""}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  orderDetailModal.status === "Chờ xác nhận" || orderDetailModal.status === "Đang xử lý"
                    ? "bg-amber-50 text-amber-700 border border-amber-200" 
                    : orderDetailModal.status === "Đang giao hàng" 
                    ? "bg-sky-50 text-sky-700 border border-sky-200" 
                    : orderDetailModal.status === "Đã hủy"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {orderDetailModal.status}
                </span>
              </div>

              {orderDetailModal.address && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-100 bg-white">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-zinc-700 text-[11px]">Địa chỉ giao hàng:</p>
                    <p className="text-zinc-600 mt-0.5">{orderDetailModal.address}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="font-bold text-zinc-800 uppercase tracking-wider text-[11px]">Danh sách sản phẩm ({orderDetailModal.items.length})</p>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden bg-white">
                  {orderDetailModal.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-zinc-400">
                            {item.size ? `Size: ${item.size}` : ""} {item.color ? `• Màu: ${item.color}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-zinc-900">{formatVND(item.price)}</p>
                        <p className="text-zinc-400 text-[10px]">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1.5 text-zinc-600">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-zinc-900">{formatVND(orderDetailModal.subtotal || orderDetailModal.total)}</span>
                </div>
                {orderDetailModal.shippingFee !== undefined && (
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-zinc-900">{formatVND(orderDetailModal.shippingFee)}</span>
                  </div>
                )}
                {orderDetailModal.discountAmount ? (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Giảm giá Voucher:</span>
                    <span>-{formatVND(orderDetailModal.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-2 border-t border-zinc-200 text-sm font-extrabold text-zinc-900">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#EE4D2D]">{formatVND(orderDetailModal.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 text-zinc-500">
                  <span>Phương thức:</span>
                  <span className="font-bold text-zinc-700">{orderDetailModal.paymentMethod || "COD (Tiền mặt)"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 flex items-center justify-end bg-zinc-50/50">
              <button
                type="button"
                onClick={() => setOrderDetailModal(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200/80 bg-zinc-100 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
