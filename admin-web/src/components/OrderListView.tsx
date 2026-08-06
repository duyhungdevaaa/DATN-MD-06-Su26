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
      case OrderStatus.PENDING: return "bg-amber-50 text-amber-700 border-amber-100";
      case OrderStatus.SHIPPING: return "bg-orange-50 text-orange-600 border-orange-100";
      case OrderStatus.DELIVERED: return "bg-green-50 text-green-700 border-green-100";
      case OrderStatus.CANCELLED: return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-neutral-50 text-neutral-500 border-neutral-200";
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
    <div className="space-y-4 animate-fade-in text-left font-sans flex flex-col h-full max-h-[calc(100vh-120px)] overflow-hidden">
      
      {/* Header Section - Compact */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h3 className="text-[24px] font-bold text-[#111827] tracking-tight leading-tight">
            Bản ghi vận đơn & Giao dịch
          </h3>
          <p className="text-[13px] font-normal text-[#6B7280] mt-0.5">
            Quản lý và theo dõi trạng thái đơn hàng
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="h-[34px] px-4 rounded-[8px] bg-[#6c5e06] hover:bg-[#5a4e05] text-white text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Xuất Excel
        </button>
      </div>

      {/* Filter Section Card - Compact */}
      <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm p-4 mb-1 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Search Input */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Tìm kiếm:</label>
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Mã đơn, khách hàng, SĐT..."
                className="w-full h-[36px] rounded-[8px] border border-[#E5E7EB] pl-[32px] pr-[10px] text-[12px] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#6c5e06]/15 focus:border-[#6c5e06] outline-none transition-all"
              />
              <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-3 w-3 text-[#9CA3AF]" />
            </div>
          </div>

          {/* Status Select */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[36px] rounded-[8px] border border-[#E5E7EB] px-[10px] text-[12px] text-[#111827] bg-[#F9FAFB] focus:bg-white outline-none transition-all cursor-pointer"
            >
              <option value="All">Tất cả</option>
              <option value={OrderStatus.PENDING}>Đang xử lý</option>
              <option value={OrderStatus.SHIPPING}>Đang giao</option>
              <option value={OrderStatus.DELIVERED}>Đã giao</option>
              <option value={OrderStatus.CANCELLED}>Đã hủy</option>
            </select>
          </div>

          {/* Payment Select */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Thanh toán:</label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[36px] rounded-[8px] border border-[#E5E7EB] px-[10px] text-[12px] text-[#111827] bg-[#F9FAFB] focus:bg-white outline-none transition-all cursor-pointer"
            >
              <option value="All">Tất cả</option>
              <option value="COD">COD</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>

          {/* Date Range - From */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Từ ngày:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[36px] rounded-[8px] border border-[#E5E7EB] px-[10px] text-[12px] text-[#111827] bg-white outline-none"
            />
          </div>

          {/* Date Range - To */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Đến ngày:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-[36px] rounded-[8px] border border-[#E5E7EB] px-[10px] text-[12px] text-[#111827] bg-white outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-1 flex justify-end">
             <button
              onClick={() => {
                setSearchText("");
                setStatusFilter("All");
                setPaymentFilter("All");
                setFromDate("");
                setToDate("");
                setCurrentPage(1);
              }}
              className="h-[34px] px-3 rounded-[8px] bg-white hover:bg-neutral-50 text-neutral-600 border border-[#E5E7EB] text-[12px] font-bold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3" />
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Main Table View - Fixed Vertical Scroll, No Horizontal Scroll */}
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col flex-1 min-h-0 relative overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <ShoppingBag className="h-6 w-6 text-neutral-300" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">Không có dữ liệu</h3>
            <p className="text-[12px] text-[#6B7280] mt-1">Vui lòng thử bộ lọc khác.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-[60px]">
            <table className="w-full text-left border-collapse table-auto">
              <thead className="sticky top-0 z-10 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <tr className="h-[44px] text-[11px] text-[#6B7280] uppercase tracking-widest font-bold">
                  <th className="px-4 pl-[20px] whitespace-nowrap">Mã đơn</th>
                  <th className="px-4 whitespace-nowrap">Thời gian</th>
                  <th className="px-4">Khách hàng</th>
                  <th className="px-4">Sản phẩm</th>
                  <th className="px-4 text-center whitespace-nowrap">Tổng tiền</th>
                  <th className="px-4 whitespace-nowrap">Thanh toán</th>
                  <th className="px-4 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="px-4 pr-[20px] text-center whitespace-nowrap">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="group h-[76px] hover:bg-[#FAFAFA]/70 transition-colors cursor-pointer"
                    onClick={() => onSelectOrder(order)}
                  >
                    <td className="px-4 pl-[20px] align-middle">
                      <span className="text-[13px] font-bold text-blue-600 uppercase tracking-tight">#{order.id}</span>
                    </td>
                    <td className="px-4 align-middle">
                      <div className="flex flex-col leading-tight whitespace-nowrap">
                        <span className="text-[12px] font-semibold text-[#111827]">{order.date}</span>
                        <span className="text-[11px] text-[#6B7280]">{order.time}</span>
                      </div>
                    </td>
                    <td className="px-4 align-middle">
                      <div className="flex flex-col text-left leading-tight max-w-[120px]">
                        <p className="text-[12px] font-semibold text-[#111827] truncate">{order.customerName}</p>
                        <p className="text-[11px] text-[#6B7280] truncate">{order.phone || "0901..."}</p>
                      </div>
                    </td>
                    <td className="px-4 align-middle">
                      <div className="flex items-center gap-2.5 max-w-[180px]">
                        <div className="h-10 w-10 rounded-lg bg-neutral-100 border border-[#E5E7EB] shrink-0 overflow-hidden">
                          <img src={order.items[0]?.imageUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#111827] truncate">{order.items[0]?.name || "Sản phẩm"}</p>
                          <p className="text-[10px] text-[#6B7280] truncate">SL: {order.items[0]?.quantity || 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 align-middle text-center">
                      <span className="text-[14px] font-bold text-[#111827] whitespace-nowrap">{formatVND(order.total)}</span>
                    </td>
                    <td className="px-4 align-middle">
                      <span className="text-[12px] font-semibold text-[#111827] whitespace-nowrap">{order.paymentMethod}</span>
                    </td>
                    <td className="px-4 align-middle text-center">
                      <span className={`inline-flex items-center justify-center h-6 px-2.5 rounded-full border text-[10px] font-bold ${getStatusBadgeClass(order.status)} whitespace-nowrap`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 pr-[20px] align-middle text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="h-8 px-3 text-[11px] font-bold text-neutral-700 bg-white hover:bg-neutral-50 border border-[#E5E7EB] rounded-md shadow-sm whitespace-nowrap flex items-center gap-1.5 mx-auto transition-all active:scale-95"
                      >
                        <Eye className="h-3 w-3" /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination UI - FIXED AT BOTTOM WITH FULL NAVIGATION */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[56px] bg-white border-t border-[#E5E7EB] px-6 flex items-center justify-between text-[12px] text-[#6B7280] font-medium shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-4">
            <span>Hiển thị {filteredOrders.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, filteredOrders.length)} / {filteredOrders.length} đơn</span>
            <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-4">
              <span>Hiện:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="h-7 border border-[#E5E7EB] rounded px-1 text-[#111827] font-bold bg-white outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Jump to page */}
            <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-1">
              <span className="text-[10px] font-bold uppercase opacity-60">Đi đến:</span>
              <input
                type="text"
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
                placeholder={currentPage.toString()}
                className="w-8 bg-transparent text-center text-[#111827] font-bold outline-none"
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

    </div>
  );
};
