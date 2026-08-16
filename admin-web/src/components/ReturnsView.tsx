/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  RotateCcw, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Coins, 
  Package, 
  ExternalLink,
  Eye,
  X,
  ChevronRight,
  TrendingDown,
  Layers,
  ArrowUpDown,
  BarChart3,
  ListOrdered,
  Warehouse,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Image as ImageIcon
} from "lucide-react";
import { Order, OrderStatus, OrderItem, ReturnedInventoryItem } from "../types";

interface ReturnsViewProps {
  orders: Order[];
  returnedInventory?: ReturnedInventoryItem[];
  onSelectOrder: (order: Order) => void;
  onApproveRefund?: (orderId: string) => void;
  onRestockItem?: (item: ReturnedInventoryItem) => void;
  onDisposeItem?: (item: ReturnedInventoryItem) => void;
}

interface ConsolidatedProduct {
  id: string;
  sku: string;
  name: string;
  imageUrl: string;
  price: number;
  totalQuantity: number;
  totalValue: number;
  returnCount: number;
  sizesBreakdown: { [size: string]: number };
  colorsBreakdown: { [color: string]: number };
  reasonsBreakdown: { [reason: string]: number };
  sampleProofImages: string[];
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  orders,
  returnedInventory = [],
  onSelectOrder,
  onApproveRefund,
  onRestockItem,
  onDisposeItem
}) => {
  // 3 Chế độ xem: WAREHOUSE (Kho Hàng Lỗi/Hoàn), BY_PRODUCTS (Thống kê theo SP), BY_ORDERS (Theo đơn)
  const [viewMode, setViewMode] = useState<"WAREHOUSE" | "BY_PRODUCTS" | "BY_ORDERS">("WAREHOUSE");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [reasonFilter, setReasonFilter] = useState<string>("ALL");
  const [warehouseStatusFilter, setWarehouseStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"QTY_DESC" | "VALUE_DESC" | "NAME_ASC">("QTY_DESC");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Lọc ra tất cả các đơn hàng có yêu cầu đổi trả hoặc đã hoàn tiền
  const returnOrders = useMemo(() => {
    return orders.filter(o => 
      o.isReturnRequested || 
      o.status === OrderStatus.REFUNDED || 
      o.status === OrderStatus.REFUND_COMPLETED || 
      (o.returnedItems && o.returnedItems.length > 0) ||
      Boolean(o.returnReason)
    );
  }, [orders]);

  // Thống kê chỉ số KPI
  const stats = useMemo(() => {
    let pendingCount = 0;
    let completedCount = 0;
    let totalRefundMoney = 0;
    let totalItemsReturned = 0;

    returnOrders.forEach(o => {
      const isApproved = o.status === OrderStatus.REFUND_COMPLETED || o.returnStatus === "APPROVED";
      if (isApproved) {
        completedCount++;
        const refundAmt = o.returnRefundAmount || Math.max(0, o.total - o.shippingFee);
        totalRefundMoney += refundAmt;
      } else {
        pendingCount++;
      }

      const items = (o.returnedItems && o.returnedItems.length > 0) ? o.returnedItems : o.items;
      items.forEach(it => {
        totalItemsReturned += (it.quantity || 1);
      });
    });

    const defectiveInStock = returnedInventory.filter(it => it.warehouseStatus === "LƯU_KHO_HANG_LOI").reduce((sum, it) => sum + (it.quantity || 1), 0);
    const disposedCount = returnedInventory.filter(it => it.warehouseStatus === "DA_XUAT_HUY").reduce((sum, it) => sum + (it.quantity || 1), 0);
    const restockedCount = returnedInventory.filter(it => it.warehouseStatus === "NHAP_LAI_KHO_BAN").reduce((sum, it) => sum + (it.quantity || 1), 0);

    return {
      pendingCount,
      completedCount,
      totalRefundMoney,
      totalItemsReturned: Math.max(totalItemsReturned, returnedInventory.length),
      defectiveInStock,
      disposedCount,
      restockedCount,
      totalReturns: returnOrders.length
    };
  }, [returnOrders, returnedInventory]);

  // Tổng hợp sản phẩm từ cả returnedInventory và returnOrders
  const consolidatedProducts = useMemo(() => {
    const map = new Map<string, ConsolidatedProduct>();

    // 1. Quét từ returnedInventory
    returnedInventory.forEach(it => {
      const rawName = (it.productName || "Sản phẩm").trim();
      const key = rawName.toLowerCase();
      const qty = Number(it.quantity || 1);
      const price = Number(it.price || 0);

      if (!map.has(key)) {
        map.set(key, {
          id: it.productId || it.id || key,
          sku: it.sku || `SKU-${key.slice(0, 4).toUpperCase()}`,
          name: rawName,
          imageUrl: it.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200",
          price: price,
          totalQuantity: qty,
          totalValue: price * qty,
          returnCount: 1,
          sizesBreakdown: it.size ? { [it.size]: qty } : {},
          colorsBreakdown: it.color ? { [it.color]: qty } : {},
          reasonsBreakdown: { [it.reason || "Lỗi sản phẩm"]: qty },
          sampleProofImages: [...(it.proofImages || [])]
        });
      } else {
        const p = map.get(key)!;
        p.totalQuantity += qty;
        p.totalValue += (p.price || price) * qty;
        p.returnCount += 1;
        if (it.size) p.sizesBreakdown[it.size] = (p.sizesBreakdown[it.size] || 0) + qty;
        if (it.color) p.colorsBreakdown[it.color] = (p.colorsBreakdown[it.color] || 0) + qty;
        const r = it.reason || "Lỗi sản phẩm";
        p.reasonsBreakdown[r] = (p.reasonsBreakdown[r] || 0) + qty;
        (it.proofImages || []).forEach(url => {
          if (!p.sampleProofImages.includes(url) && p.sampleProofImages.length < 5) {
            p.sampleProofImages.push(url);
          }
        });
      }
    });

    // 2. Quét bổ sung từ returnOrders nếu chưa có trong returnedInventory
    if (returnedInventory.length === 0) {
      returnOrders.forEach(order => {
        const items = (order.returnedItems && order.returnedItems.length > 0) ? order.returnedItems : order.items;
        const orderReason = order.returnReason || "Lỗi sản phẩm / Không đúng mô tả";
        const orderProofs = order.returnImages || [];

        items.forEach(it => {
          const rawName = (it.name || "Sản phẩm").trim();
          const key = rawName.toLowerCase();
          const qty = Number(it.quantity || 1);
          const price = Number(it.price || 0);

          if (!map.has(key)) {
            map.set(key, {
              id: it.id || key,
              sku: it.sku || `SKU-${key.slice(0, 4).toUpperCase()}`,
              name: rawName,
              imageUrl: it.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200",
              price: price,
              totalQuantity: qty,
              totalValue: price * qty,
              returnCount: 1,
              sizesBreakdown: it.size ? { [it.size]: qty } : {},
              colorsBreakdown: it.color ? { [it.color]: qty } : {},
              reasonsBreakdown: { [orderReason]: qty },
              sampleProofImages: [...orderProofs]
            });
          } else {
            const p = map.get(key)!;
            p.totalQuantity += qty;
            p.totalValue += (p.price || price) * qty;
            p.returnCount += 1;
            if (it.size) p.sizesBreakdown[it.size] = (p.sizesBreakdown[it.size] || 0) + qty;
            if (it.color) p.colorsBreakdown[it.color] = (p.colorsBreakdown[it.color] || 0) + qty;
            p.reasonsBreakdown[orderReason] = (p.reasonsBreakdown[orderReason] || 0) + qty;
          }
        });
      });
    }

    let result = Array.from(map.values());

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    }

    if (sortBy === "QTY_DESC") {
      result.sort((a, b) => b.totalQuantity - a.totalQuantity);
    } else if (sortBy === "VALUE_DESC") {
      result.sort((a, b) => b.totalValue - a.totalValue);
    } else if (sortBy === "NAME_ASC") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [returnedInventory, returnOrders, searchTerm, sortBy]);

  // Lọc kho hàng lỗi/hoàn
  const filteredWarehouseItems = useMemo(() => {
    return returnedInventory.filter(it => {
      if (warehouseStatusFilter !== "ALL" && it.warehouseStatus !== warehouseStatusFilter) {
        return false;
      }
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchName = it.productName.toLowerCase().includes(term);
        const matchOrder = it.orderId.toLowerCase().includes(term);
        const matchCustomer = (it.customerName || "").toLowerCase().includes(term);
        return matchName || matchOrder || matchCustomer;
      }
      return true;
    });
  }, [returnedInventory, warehouseStatusFilter, searchTerm]);

  // Lọc danh sách theo từng đơn
  const filteredOrders = useMemo(() => {
    return returnOrders.filter(o => {
      if (statusFilter === "PENDING") {
        if (o.status === OrderStatus.REFUND_COMPLETED || o.returnStatus === "APPROVED") return false;
      } else if (statusFilter === "COMPLETED") {
        if (o.status !== OrderStatus.REFUND_COMPLETED && o.returnStatus !== "APPROVED") return false;
      }

      if (reasonFilter !== "ALL") {
        const reason = o.returnReason || "";
        if (!reason.toLowerCase().includes(reasonFilter.toLowerCase())) return false;
      }

      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchId = o.id.toLowerCase().includes(term);
        const matchCustomer = (o.customerName || "").toLowerCase().includes(term);
        const matchPhone = (o.phone || "").includes(term);
        const items = (o.returnedItems && o.returnedItems.length > 0) ? o.returnedItems : o.items;
        const matchItem = items.some(it => (it.name || "").toLowerCase().includes(term));

        return matchId || matchCustomer || matchPhone || matchItem;
      }

      return true;
    });
  }, [returnOrders, statusFilter, reasonFilter, searchTerm]);

  const handleApprove = async (orderId: string) => {
    if (!onApproveRefund || processingOrderId) return;
    setProcessingOrderId(orderId);
    try {
      await onApproveRefund(orderId);
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left pb-12 font-sans">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-sans text-lg font-bold text-zinc-950">Quản lý Đổi Trả & Kho Hàng Hoàn</h2>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
              {stats.totalItemsReturned} món
            </span>
          </div>
        </div>

        {/* 3 Nút chuyển đổi chế độ xem */}
        <div className="flex flex-wrap items-center bg-zinc-100 p-1 rounded-xl shrink-0 border border-zinc-200/80">
          
          {/* Nút 1: Kho Lưu Trữ Hàng Hoàn & Hàng Lỗi */}
          <button
            onClick={() => setViewMode("WAREHOUSE")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "WAREHOUSE" 
                ? "bg-white text-zinc-950 shadow-xs border border-zinc-200 font-extrabold" 
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Warehouse className="h-4 w-4 text-amber-600" />
            <span>Kho Hàng Hoàn / Hàng Lỗi</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {returnedInventory.length}
            </span>
          </button>

          {/* Nút 2: Thống kê Tất cả Sản phẩm Thu hồi */}
          <button
            onClick={() => setViewMode("BY_PRODUCTS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "BY_PRODUCTS" 
                ? "bg-white text-zinc-950 shadow-xs border border-zinc-200 font-extrabold" 
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <span>Thống kê Sản phẩm Thu hồi</span>
            <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {consolidatedProducts.length}
            </span>
          </button>

          {/* Nút 3: Theo từng Đơn hàng */}
          <button
            onClick={() => setViewMode("BY_ORDERS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "BY_ORDERS" 
                ? "bg-white text-zinc-950 shadow-xs border border-zinc-200 font-extrabold" 
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <ListOrdered className="h-4 w-4 text-rose-600" />
            <span>Theo Đơn hàng</span>
            <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {returnOrders.length}
            </span>
          </button>

        </div>
      </div>

      {/* 4 Thẻ Thống kê KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Đang lưu kho lỗi chờ kiểm định */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Chờ kiểm định / Lưu kho</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-amber-600">{stats.defectiveInStock}</span>
              <span className="text-xs text-zinc-400 font-medium">sản phẩm</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Warehouse className="h-5 w-5" />
          </div>
        </div>

        {/* Thẻ 2: Đã xuất hủy phế phẩm */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Đã xuất hủy (Lỗi/Hỏng)</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-rose-600">{stats.disposedCount}</span>
              <span className="text-xs text-zinc-400 font-medium">món hủy</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Trash2 className="h-5 w-5" />
          </div>
        </div>

        {/* Thẻ 3: Đã nhập lại kho bán */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Đạt chuẩn (Nhập lại kho)</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-emerald-600">{stats.restockedCount}</span>
              <span className="text-xs text-zinc-400 font-medium">món đạt</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Thẻ 4: Tổng tiền đã hoàn */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Tổng tiền đã hoàn ví</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-xl font-bold font-mono text-blue-700">{formatVND(stats.totalRefundMoney)}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Coins className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 1: KHO LƯU TRỮ HÀNG HOÀN & HÀNG LỖI (ĐỘC LẬP VỚI KHO BÁN CHÍNH) */}
      {/* ========================================================================= */}
      {viewMode === "WAREHOUSE" && (
        <div className="space-y-4">
          
          {/* Thanh tìm kiếm & Bộ lọc Kho Hàng Lỗi */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm lỗi, mã đơn, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-800 font-medium"
              />
            </div>

            <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
              <button
                onClick={() => setWarehouseStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  warehouseStatusFilter === "ALL" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Tất cả ({returnedInventory.length})
              </button>
              <button
                onClick={() => setWarehouseStatusFilter("LƯU_KHO_HANG_LOI")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  warehouseStatusFilter === "LƯU_KHO_HANG_LOI" ? "bg-white text-amber-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Chờ kiểm định ({returnedInventory.filter(i => i.warehouseStatus === "LƯU_KHO_HANG_LOI").length})
              </button>
              <button
                onClick={() => setWarehouseStatusFilter("NHAP_LAI_KHO_BAN")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  warehouseStatusFilter === "NHAP_LAI_KHO_BAN" ? "bg-white text-emerald-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Đạt chuẩn ({returnedInventory.filter(i => i.warehouseStatus === "NHAP_LAI_KHO_BAN").length})
              </button>
              <button
                onClick={() => setWarehouseStatusFilter("DA_XUAT_HUY")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  warehouseStatusFilter === "DA_XUAT_HUY" ? "bg-white text-rose-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Đã xuất hủy ({returnedInventory.filter(i => i.warehouseStatus === "DA_XUAT_HUY").length})
              </button>
            </div>
          </div>

          {/* Bảng Quản lý Kho Hàng Hoàn / Hàng Lỗi */}
          {filteredWarehouseItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <Warehouse className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">Kho hàng hoàn hiện đang trống</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">
                Khi duyệt hoàn tiền, các sản phẩm trả về sẽ tự động được lưu trữ tại đây thay vì cộng vào kho bán chính.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Sản phẩm thu hồi</th>
                      <th className="py-3.5 px-4">Mã đơn & Ngày thu hồi</th>
                      <th className="py-3.5 px-4 text-center">Số lượng</th>
                      <th className="py-3.5 px-4">Lý do & Lời nhắn</th>
                      <th className="py-3.5 px-4 text-center">Bằng chứng</th>
                      <th className="py-3.5 px-4">Trạng thái kho</th>
                      <th className="py-3.5 px-4 text-right">Kiểm định & Xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredWarehouseItems.map((item) => {
                      const isStillInDefectiveStock = item.warehouseStatus === "LƯU_KHO_HANG_LOI";

                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                          
                          {/* Sản phẩm */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-12 h-14 object-cover rounded-xl bg-zinc-100 shrink-0 border border-zinc-200 shadow-2xs"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200";
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-900 text-xs truncate max-w-xs">{item.productName}</p>
                                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{item.sku || item.productId}</p>
                                <p className="text-[10px] text-zinc-600 mt-1">
                                  {item.size ? `Size: ${item.size}` : ''} {item.color ? `• Màu: ${item.color}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Mã đơn & Ngày */}
                          <td className="py-4 px-4">
                            <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 text-[11px]">
                              #{item.orderId}
                            </span>
                            <p className="text-[10px] text-zinc-500 mt-1 font-medium">{item.returnedAt}</p>
                            <p className="text-[10px] text-zinc-700 font-bold mt-0.5">{item.customerName} ({item.customerPhone})</p>
                          </td>

                          {/* Số lượng */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center font-mono text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg">
                              x{item.quantity} món
                            </span>
                          </td>

                          {/* Lý do & Lời nhắn */}
                          <td className="py-4 px-4 max-w-xs">
                            <span className="inline-block bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200">
                              {item.reason}
                            </span>
                            {item.description && (
                              <p className="text-[11px] text-zinc-600 italic mt-1 leading-snug truncate max-w-xs">
                                "{item.description}"
                              </p>
                            )}
                          </td>

                          {/* Bằng chứng */}
                          <td className="py-4 px-4 text-center">
                            {item.proofImages && item.proofImages.length > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {item.proofImages.map((img, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setPreviewImageUrl(img)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 hover:border-zinc-900 transition-all cursor-pointer"
                                  >
                                    <img src={img} alt="Bằng chứng" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-300 text-[11px]">Không có</span>
                            )}
                          </td>

                          {/* Trạng thái kho */}
                          <td className="py-4 px-4">
                            {item.warehouseStatus === "LƯU_KHO_HANG_LOI" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Chờ kiểm định chất lượng
                              </span>
                            )}
                            {item.warehouseStatus === "DA_XUAT_HUY" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Đã xuất hủy phế phẩm
                              </span>
                            )}
                            {item.warehouseStatus === "NHAP_LAI_KHO_BAN" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Đạt chuẩn (Đã nhập kho bán)
                              </span>
                            )}
                            {item.note && (
                              <p className="text-[9px] text-zinc-400 mt-1">{item.note}</p>
                            )}
                          </td>

                          {/* Thao tác (Chỉ 2 lựa chọn: 1 là Đạt chuẩn nhập kho bán, 2 là Hủy phế phẩm) */}
                          <td className="py-4 px-4 text-right">
                            {isStillInDefectiveStock ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {onRestockItem && (
                                  <button
                                    onClick={() => onRestockItem(item)}
                                    title="Kiểm định đạt chuẩn 100% và nhập lại vào kho bán lẻ"
                                    className="p-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Đạt chuẩn (Nhập kho)</span>
                                  </button>
                                )}

                                {onDisposeItem && (
                                  <button
                                    onClick={() => onDisposeItem(item)}
                                    title="Hàng lỗi/rách hỏng: Xuất hủy hoàn toàn, không bán hàng kém chất lượng"
                                    className="p-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Xuất hủy</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-400 font-medium italic">Đã xử lý xong</span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 2: BẢNG THỐNG KÊ TẤT CẢ SẢN PHẨM THU HỒI (THEO SẢN PHẨM) */}
      {/* ========================================================================= */}
      {viewMode === "BY_PRODUCTS" && (
        <div className="space-y-4">
          
          {/* Thanh tìm kiếm & Sắp xếp sản phẩm */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm thu hồi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-800 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-bold flex items-center gap-1 shrink-0">
                <ArrowUpDown className="h-3.5 w-3.5" /> Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-700 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-900 cursor-pointer"
              >
                <option value="QTY_DESC">Thu hồi nhiều nhất</option>
                <option value="VALUE_DESC">Giá trị thu hồi cao nhất</option>
                <option value="NAME_ASC">Tên sản phẩm A-Z</option>
              </select>
            </div>
          </div>

          {/* Bảng Danh Sách Sản Phẩm Thu Hồi */}
          {consolidatedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <Package className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">Chưa có sản phẩm thu hồi nào</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">
                Hiện tại chưa có sản phẩm nào bị khách hàng yêu cầu đổi trả hoặc hoàn hàng.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Sản phẩm</th>
                      <th className="py-3.5 px-4 text-center">Tổng SL Thu Hồi</th>
                      <th className="py-3.5 px-4">Biến thể bị hoàn (Size / Màu)</th>
                      <th className="py-3.5 px-4">Lý do hoàn phổ biến</th>
                      <th className="py-3.5 px-4 text-right">Đơn giá</th>
                      <th className="py-3.5 px-4 text-right">Tổng giá trị thu hồi</th>
                      <th className="py-3.5 px-4 text-center">Ảnh bằng chứng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {consolidatedProducts.map((prod, idx) => {
                      const sizesList = Object.entries(prod.sizesBreakdown);
                      const colorsList = Object.entries(prod.colorsBreakdown);
                      const reasonsList = Object.entries(prod.reasonsBreakdown).sort((a, b) => b[1] - a[1]);

                      return (
                        <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                          
                          {/* Cột 1: Sản phẩm */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-12 h-14 object-cover rounded-xl bg-zinc-100 shrink-0 border border-zinc-200 shadow-2xs"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200";
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-900 text-xs truncate max-w-xs">{prod.name}</p>
                                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{prod.sku}</p>
                                <span className="inline-block mt-1 text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md font-medium">
                                  Bị hoàn qua {prod.returnCount} lượt
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Cột 2: Tổng SL thu hồi */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center font-mono text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl">
                              x{prod.totalQuantity} món
                            </span>
                          </td>

                          {/* Cột 3: Biến thể Size & Màu */}
                          <td className="py-4 px-4">
                            <div className="space-y-1.5 max-w-xs">
                              {sizesList.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className="text-[10px] font-bold text-zinc-400 mr-1">Size:</span>
                                  {sizesList.map(([size, count], sIdx) => (
                                    <span key={sIdx} className="bg-zinc-100 text-zinc-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-zinc-200">
                                      {size} ({count})
                                    </span>
                                  ))}
                                </div>
                              )}

                              {colorsList.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className="text-[10px] font-bold text-zinc-400 mr-1">Màu:</span>
                                  {colorsList.map(([color, count], cIdx) => (
                                    <span key={cIdx} className="bg-zinc-100 text-zinc-800 text-[10px] font-medium px-1.5 py-0.5 rounded border border-zinc-200">
                                      {color} ({count})
                                    </span>
                                  ))}
                                </div>
                              )}

                              {sizesList.length === 0 && colorsList.length === 0 && (
                                <span className="text-zinc-400 italic text-[11px]">Tiêu chuẩn</span>
                              )}
                            </div>
                          </td>

                          {/* Cột 4: Lý do hoàn */}
                          <td className="py-4 px-4">
                            <div className="space-y-1 max-w-xs">
                              {reasonsList.slice(0, 2).map(([reason, count], rIdx) => (
                                <div key={rIdx} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                  <span className="text-zinc-800 font-medium truncate">{reason}</span>
                                  <span className="text-zinc-400 font-bold">({count})</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Cột 5: Đơn giá */}
                          <td className="py-4 px-4 text-right font-mono font-medium text-zinc-600">
                            {formatVND(prod.price)}
                          </td>

                          {/* Cột 6: Tổng giá trị thu hồi */}
                          <td className="py-4 px-4 text-right font-mono font-bold text-purple-700 text-sm">
                            {formatVND(prod.totalValue)}
                          </td>

                          {/* Cột 7: Ảnh bằng chứng */}
                          <td className="py-4 px-4 text-center">
                            {prod.sampleProofImages.length > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {prod.sampleProofImages.slice(0, 2).map((img, iIdx) => (
                                  <button
                                    key={iIdx}
                                    onClick={() => setPreviewImageUrl(img)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 hover:border-zinc-900 transition-all cursor-pointer"
                                  >
                                    <img src={img} alt="Bằng chứng" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                                {prod.sampleProofImages.length > 2 && (
                                  <span className="text-[10px] font-bold text-zinc-400">
                                    +{prod.sampleProofImages.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-300 text-[11px]">Không có</span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 3: DANH SÁCH THEO TỪNG ĐƠN HÀNG ĐỔI TRẢ */}
      {/* ========================================================================= */}
      {viewMode === "BY_ORDERS" && (
        <div className="space-y-4">
          
          {/* Thanh Bộ lọc thông minh */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, khách hàng, số điện thoại, tên món..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-800 font-medium"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "ALL" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Tất cả ({returnOrders.length})
                </button>
                <button
                  onClick={() => setStatusFilter("PENDING")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "PENDING" ? "bg-white text-amber-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Chờ duyệt ({stats.pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter("COMPLETED")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "COMPLETED" ? "bg-white text-emerald-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Đã hoàn tiền ({stats.completedCount})
                </button>
              </div>

              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-700 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-900 cursor-pointer"
              >
                <option value="ALL">Mọi lý do hoàn</option>
                <option value="Sai kích thước">Sai kích thước</option>
                <option value="Sai màu sắc">Sai màu sắc</option>
                <option value="Sản phẩm lỗi">Sản phẩm lỗi</option>
                <option value="Không giống mô tả">Không giống mô tả</option>
                <option value="Giao nhầm sản phẩm">Giao nhầm sản phẩm</option>
              </select>
            </div>
          </div>

          {/* Bảng Danh Sách Hàng Hoàn Theo Đơn */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">Không có đơn hàng hoàn trả nào</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">
                Hiện không có yêu cầu đổi trả hoặc sản phẩm thu hồi nào khớp với điều kiện tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isApproved = order.status === OrderStatus.REFUND_COMPLETED || order.returnStatus === "APPROVED";
                const items = (order.returnedItems && order.returnedItems.length > 0) ? order.returnedItems : order.items;
                const refundAmt = order.returnRefundAmount || Math.max(0, order.total - order.shippingFee);
                const proofImages = (order.returnImages && order.returnImages.length > 0) ? order.returnImages : [];
                const reason = order.returnReason || "Lỗi sản phẩm / Không đúng mô tả";

                return (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 bg-zinc-50/70 border-b border-zinc-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                          #{order.id}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          Đặt ngày: <span className="text-zinc-700 font-bold">{order.date} {order.time}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isApproved 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-emerald-600" : "bg-amber-600"}`} />
                          {isApproved ? "Đã duyệt & Hoàn tiền" : "Chờ duyệt hoàn tiền"}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      
                      {/* Khách hàng & Lý do */}
                      <div className="lg:col-span-4 space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Khách hàng</span>
                          <p className="font-bold text-zinc-900 text-sm mt-0.5">{order.customerName}</p>
                          <p className="text-xs text-zinc-500 font-mono">{order.phone} {order.email ? `• ${order.email}` : ''}</p>
                        </div>

                        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Lý do hoàn trả:</span>
                          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span>{reason}</span>
                          </p>
                          {order.returnDescription && (
                            <p className="text-[11px] text-zinc-600 italic bg-white/70 p-2 rounded-lg border border-rose-100 mt-1">
                              "{order.returnDescription}"
                            </p>
                          )}
                        </div>

                        {proofImages.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                              Ảnh bằng chứng ({proofImages.length}):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {proofImages.map((imgUrl, i) => (
                                <button
                                  key={i}
                                  onClick={() => setPreviewImageUrl(imgUrl)}
                                  className="relative group w-14 h-14 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 hover:border-zinc-900 transition-all cursor-pointer"
                                >
                                  <img 
                                    src={imgUrl} 
                                    alt={`Bằng chứng ${i + 1}`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Eye className="h-4 w-4" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sản phẩm thu hồi */}
                      <div className="lg:col-span-5 space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Sản phẩm thu hồi ({items.length} món):
                        </span>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-2.5 bg-zinc-50 rounded-xl border border-zinc-150 text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={it.imageUrl}
                                  alt={it.name}
                                  className="w-10 h-12 object-cover rounded-lg bg-zinc-200 shrink-0 border border-zinc-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200";
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-zinc-900 truncate">{it.name}</p>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">
                                    {it.size ? `Size ${it.size}` : ''} {it.color ? `• Màu ${it.color}` : ''} • SL: <span className="font-bold text-rose-600 font-mono">x{it.quantity}</span>
                                  </p>
                                  <p className="text-[10px] font-mono text-zinc-600 mt-0.5">
                                    Đơn giá: {formatVND(it.price)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-zinc-900 text-xs shrink-0">
                                {formatVND(it.price * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tiền hoàn & Hành động */}
                      <div className="lg:col-span-3 bg-zinc-50/80 p-4 rounded-xl border border-zinc-200/80 flex flex-col justify-between h-full space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tiền hoàn vào ví:</span>
                          <p className="font-mono text-xl font-bold text-rose-600 mt-1">
                            {formatVND(refundAmt)}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                            (Đã trừ voucher, không hoàn phí ship)
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-200">
                          {!isApproved && onApproveRefund && (
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={processingOrderId === order.id}
                              className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Coins className="h-4 w-4" />
                              {processingOrderId === order.id ? "Đang xử lý..." : "Duyệt hoàn tiền"}
                            </button>
                          )}

                          <button
                            onClick={() => onSelectOrder(order)}
                            className="w-full py-2.5 px-3 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Xem chi tiết đơn
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Image Lightbox Preview Modal */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div 
            className="relative bg-white p-3 rounded-2xl max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img 
              src={previewImageUrl} 
              alt="Bằng chứng trả hàng phóng to" 
              className="max-h-[75vh] w-auto object-contain rounded-xl mx-auto"
            />
            <p className="text-center text-xs font-bold text-zinc-500 mt-2">
              Ảnh bằng chứng xác thực từ ứng dụng khách hàng
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
