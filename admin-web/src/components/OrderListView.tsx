/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  DollarSign, 
  Calendar,
  Layers,
  Sparkles,
  UserCheck,
  Phone,
  MapPin,
  MoreVertical,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderListViewProps {
  orders: Order[];
  searchText: string;
  setSearchText: (text: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const OrderListView: React.FC<OrderListViewProps> = ({
  orders,
  searchText,
  setSearchText,
  onSelectOrder
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPage, setJumpPage] = useState<string>("");

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Helper to parse DD/MM/YYYY to Date object
  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(NaN);
  };

  // Filters logic
  const filteredOrders = orders.filter((order) => {
    const term = searchText.toLowerCase().trim();
    const matchesSearch = !term ||
      order.id.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      order.phone.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || order.paymentMethod === paymentFilter;

    let matchesDate = true;
    if (fromDate || toDate) {
      const orderDate = parseDate(order.date);
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) matchesDate = false;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  // Derived pagination data
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PROCESSING:
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case OrderStatus.SHIPPING:
        return "bg-sky-50 text-sky-700 border-sky-200/50";
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-700 border-green-200/50";
      case OrderStatus.REFUNDED:
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      case OrderStatus.REFUND_COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      default:
        return "bg-neutral-100 text-neutral-500 border-neutral-200";
    }
  };

  const handleJumpPage = () => {
    const p = parseInt(jumpPage);
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPage("");
    }
  };

  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      alert("Không có dữ liệu để xuất Excel");
      return;
    }

    // Define CSV Headers
    const headers = [
      "Mã đơn hàng",
      "Ngày đặt",
      "Giờ đặt",
      "Khách hàng",
      "Số điện thoại",
      "Địa chỉ",
      "Sản phẩm",
      "Tổng tiền (VNĐ)",
      "Thanh toán",
      "Trạng thái"
    ];

    // Map data rows
    const rows = filteredOrders.map(order => [
      `#${order.id}`,
      order.date,
      order.time,
      order.customerName,
      `'${order.phone || ""}`, // Prefix with ' to treat as text in Excel
      `"${(order.address || "").replace(/"/g, '""')}"`, // Escape quotes
      `"${(order.items?.[0]?.name || "Sản phẩm").replace(/"/g, '""')}${order.items.length > 1 ? ` (+${order.items.length - 1})` : ""}"`,
      order.total,
      order.paymentMethod,
      order.status
    ]);

    // Construct CSV content with BOM for UTF-8 support in Excel
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const fileName = `Trendify_Orders_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Search and control filter line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div>
          <h3 className="font-sans text-lg text-zinc-900 font-bold">Bản ghi vận đơn & Giao dịch</h3>
          <p className="font-sans text-xs text-zinc-400 mt-1">
            Ghi nhận trạng thái hoàn thiện sản hóa Haute Couture, theo dõi thời trình giao nhận thông qua Giao Hàng Tiết Kiệm (GHTK).
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Status filters selection dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Bộ trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none focus:bg-white font-sans text-zinc-700 font-bold"
            >
              <option value="All">Tất cả vận đơn</option>
              <option value={OrderStatus.PROCESSING}>Đang xử lý ({orders.filter(o => o.status === OrderStatus.PROCESSING).length})</option>
              <option value={OrderStatus.SHIPPING}>Đang giao ({orders.filter(o => o.status === OrderStatus.SHIPPING).length})</option>
              <option value={OrderStatus.DELIVERED}>Đã hoàn thành ({orders.filter(o => o.status === OrderStatus.DELIVERED).length})</option>
              <option value={OrderStatus.CANCELLED}>Đã hủy ({orders.filter(o => o.status === OrderStatus.CANCELLED).length})</option>
            </select>
          </div>
          <button
            onClick={handleExportExcel}
            className="h-[34px] px-4 rounded-[8px] bg-[#6c5e06] hover:bg-[#5a4e05] text-white text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Main Table Grid View */}
      {paginatedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-16 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4">
            <ShoppingBag className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="font-sans text-lg text-zinc-800 font-medium">Không tìm thấy mã đơn hàng phù hợp</h3>
          <p className="font-sans text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Vui lòng thử gõ từ khóa tìm kiếm khác hoặc đổi bộ lọc trạng thái đơn hàng.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden pb-[56px] relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 font-sans text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                  <th className="p-5 pl-8">Mã vận đơn (ID)</th>
                  <th className="p-5">Thượng khách</th>
                  <th className="p-5">Chi tiết sản phẩm dệt may</th>
                  <th className="p-5 text-right">Tổng thanh toán</th>
                  <th className="p-5 text-center">Trạng thái vận đơn</th>
                  <th className="p-5 pr-8 text-center">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginatedOrders.map((order) => {
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-zinc-50/60 transition-colors duration-250 cursor-pointer font-sans"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* Code ID */}
                      <td className="p-5 pl-8 align-middle">
                        <span className="font-mono text-xs font-bold text-zinc-950 tracking-wider uppercase block">
                          #{order.id}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-400 block mt-1 font-bold">
                          {order.date} • {order.time}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-zinc-100 bg-zinc-50 shrink-0">
                            <img 
                              src={order.customerAvatar} 
                              alt={order.customerName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-800 leading-none">
                              {order.customerName}
                            </p>
                            <span className="text-[10px] text-zinc-400 mt-1 block tracking-tight truncate max-w-[140px]">
                              {order.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Items previews summary */}
                      <td className="p-5 align-middle">
                        <div className="flex items-center gap-2 max-w-sm">
                          <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-neutral-100">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-850 truncate leading-none">
                              {order.items[0]?.name || "Đang dệt may..."}
                            </p>
                            <span className="text-[9px] text-zinc-400 mt-1 block font-bold">
                              {order.items.length > 1 ? `và ${order.items.length - 1} áo quần phụ kiện khác` : `Mã hàng: ${order.items[0]?.sku || "-"}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Calculations total sum block */}
                      <td className="p-5 align-middle text-right">
                        <strong className="font-mono text-xs font-bold text-zinc-950 block">
                          {formatVND(order.total)}
                        </strong>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-1 block font-bold">
                          {order.paymentMethod || "Thẻ Visa"}
                        </span>
                      </td>

                      {/* Status design control */}
                      <td className="p-5 align-middle text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${
                          order.status === OrderStatus.AWAITING_PAYMENT
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : order.status === OrderStatus.PROCESSING
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : order.status === OrderStatus.SHIPPING
                            ? "bg-sky-50 text-sky-700 border-sky-100"
                            : order.status === OrderStatus.DELIVERED
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : order.status === OrderStatus.REFUNDED
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : order.status === OrderStatus.REFUND_COMPLETED
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100" // Cancelled
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === OrderStatus.AWAITING_PAYMENT 
                              ? 'bg-amber-500 animate-pulse' 
                              : order.status === OrderStatus.PROCESSING 
                              ? 'bg-purple-500 animate-pulse' 
                              : order.status === OrderStatus.SHIPPING 
                              ? "bg-sky-500 animate-pulse" 
                              : order.status === OrderStatus.CANCELLED
                              ? "bg-red-500"
                              : order.status === OrderStatus.REFUNDED
                              ? "bg-rose-500"
                              : "bg-emerald-500" // DELIVERED
                          }`} />
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5 align-middle pr-8 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 px-3 text-[10px] font-bold uppercase tracking-wider font-sans rounded-lg bg-zinc-50 hover:bg-[#8c7623]/10 text-zinc-650 hover:text-[#8c7623] border border-zinc-200/80 transition-colors duration-200 inline-flex items-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination UI */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[56px] bg-white border-t border-zinc-100 px-6 flex items-center justify-between text-[12px] text-zinc-500 font-medium shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-4">
              <span>Hiển thị {filteredOrders.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, filteredOrders.length)} / {filteredOrders.length} đơn</span>
              <div className="flex items-center gap-2 border-l border-zinc-100 pl-4">
                <span>Hiện:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="h-7 border border-zinc-200 rounded px-1 text-zinc-900 font-bold bg-white outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Jump to page */}
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1">
                <span className="text-[10px] font-bold uppercase opacity-60">Đi đến:</span>
                <input
                  type="text"
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
                  placeholder={currentPage.toString()}
                  className="w-8 bg-transparent text-center text-zinc-900 font-bold outline-none"
                />
                <button onClick={handleJumpPage} className="text-[10px] font-bold text-[#6c5e06] hover:underline">GO</button>
              </div>

              {/* Numeric Pages Navigation */}
              <div className="flex items-center gap-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 disabled:opacity-25"><ChevronsLeft className="h-3.5 w-3.5" /></button>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 disabled:opacity-25"><ChevronLeft className="h-3.5 w-3.5" /></button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && p - arr[i-1] > 1 && <span className="text-neutral-300">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 flex items-center justify-center rounded transition-all font-bold ${currentPage === p ? "bg-[#6c5e06] text-white shadow-sm" : "hover:bg-neutral-50"}`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))
                  }
                </div>

                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 disabled:opacity-25"><ChevronRight className="h-3.5 w-3.5" /></button>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 disabled:opacity-25"><ChevronsRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
