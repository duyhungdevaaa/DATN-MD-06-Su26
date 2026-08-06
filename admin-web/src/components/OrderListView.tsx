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
  FileSpreadsheet
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
      case OrderStatus.PENDING: return "bg-amber-50 text-amber-600 border-amber-100";
      case OrderStatus.SHIPPING: return "bg-orange-50 text-orange-600 border-orange-100";
      case OrderStatus.DELIVERED: return "bg-green-50 text-green-700 border-green-100";
      case OrderStatus.CANCELLED: return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-neutral-50 text-neutral-500 border-neutral-200";
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-100px)] space-y-3 font-sans animate-fade-in text-left">
      
      {/* Header Section - Minimized */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h3 className="text-xl font-bold text-[#111827] tracking-tight">Bản ghi vận đơn & Giao dịch</h3>
          <p className="text-xs text-[#6B7280]">Quản lý và theo dõi trạng thái đơn hàng</p>
        </div>
        <button className="h-8 px-3 rounded-lg bg-[#6c5e06] hover:bg-[#5a4e05] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Xuất Excel
        </button>
      </div>

      {/* Filter Section Card - Ultra Compact */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-3 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tìm kiếm:</label>
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                placeholder="Mã đơn, khách hàng, SĐT..."
                className="w-full h-9 rounded-lg border border-[#E5E7EB] pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-[#6c5e06]/10"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
            </div>
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs bg-[#F9FAFB] outline-none"
            >
              <option value="All">Tất cả</option>
              <option value={OrderStatus.PENDING}>Đang xử lý</option>
              <option value={OrderStatus.SHIPPING}>Đang giao</option>
              <option value={OrderStatus.DELIVERED}>Đã giao</option>
              <option value={OrderStatus.CANCELLED}>Đã hủy</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Thanh toán:</label>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="w-full h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs bg-[#F9FAFB] outline-none"
            >
              <option value="All">Tất cả</option>
              <option value="COD">COD</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Từ ngày:</label>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }} className="w-full h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs outline-none" />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Đến ngày:</label>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }} className="w-full h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs outline-none" />
          </div>
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={() => { setSearchText(""); setStatusFilter("All"); setPaymentFilter("All"); setFromDate(""); setToDate(""); setCurrentPage(1); }}
              className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-xs font-bold text-[#6B7280] hover:bg-neutral-50 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Container - Fixed Heights */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col flex-1 min-h-0 relative overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <ShoppingBag className="h-10 w-10 text-neutral-200 mb-2" />
            <h3 className="text-sm font-bold text-neutral-800">Không có dữ liệu</h3>
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1 mb-[56px]">
              <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                <thead className="sticky top-0 z-10 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                  <tr className="h-10 text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">
                    <th className="w-[150px] px-4">Mã đơn hàng</th>
                    <th className="w-[110px] px-4">Ngày đặt</th>
                    <th className="w-[210px] px-4">Khách hàng</th>
                    <th className="px-4">Sản phẩm</th>
                    <th className="w-[120px] px-4 text-center">Tổng tiền</th>
                    <th className="w-[150px] px-4">Thanh toán</th>
                    <th className="w-[140px] px-4 text-center">Trạng thái</th>
                    <th className="w-[100px] px-4 pr-[20px] text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="h-[74px] hover:bg-neutral-50/50 transition-colors cursor-pointer" onClick={() => onSelectOrder(order)}>
                      <td className="px-4 align-middle font-bold text-blue-600 text-[13px] whitespace-nowrap">#{order.id}</td>
                      <td className="px-4 align-middle leading-tight">
                        <div className="text-[12px] font-semibold text-[#111827]">{order.date}</div>
                        <div className="text-[11px] text-[#6B7280]">{order.time}</div>
                      </td>
                      <td className="px-4 align-middle leading-tight">
                        <div className="text-[12px] font-semibold text-[#111827] truncate">{order.customerName}</div>
                        <div className="flex items-center gap-1 text-[11px] text-[#6B7280] mt-0.5"><Phone className="h-2.5 w-2.5 opacity-60" /> {order.phone || "0901..."}</div>
                        <div className="flex items-center gap-1 text-[11px] text-[#6B7280]"><MapPin className="h-2.5 w-2.5 opacity-60" /> <span className="truncate">{order.address || "Hà Nội"}</span></div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="h-11 w-11 rounded-lg bg-neutral-100 border border-[#E5E7EB] shrink-0 overflow-hidden shadow-xs">
                            <img src={order.items[0]?.imageUrl} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-[#111827] truncate">{order.items[0]?.name || "Sản phẩm"}</p>
                            <p className="text-[11px] text-[#6B7280] truncate">{order.items[0]?.size ? `S: ${order.items[0].size}` : "S: M"}{order.items[0]?.color ? ` - ${order.items[0].color}` : ""}</p>
                            <p className="text-[11px] font-bold text-[#6B7280]">SL: {order.items[0]?.quantity || 1}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 align-middle text-center font-bold text-[#111827] text-[15px]">{formatVND(order.total)}</td>
                      <td className="px-4 align-middle leading-tight">
                        <div className="text-[12px] font-semibold text-[#111827]">{order.paymentMethod === "COD" ? "COD" : "C.Khoản"}</div>
                        <div className="text-[11px] text-[#6B7280]">{order.paymentMethod === "COD" ? "Tại chỗ" : "Ngân hàng"}</div>
                      </td>
                      <td className="px-4 align-middle text-center">
                        <span className={`inline-flex items-center h-6 px-2.5 rounded-full border text-[10px] font-bold gap-1.5 ${getStatusBadgeClass(order.status)}`}>
                          <span className={`w-1 h-1 rounded-full ${order.status === OrderStatus.PENDING ? 'bg-amber-500' : order.status === OrderStatus.SHIPPING ? "bg-orange-500" : order.status === OrderStatus.CANCELLED ? "bg-red-500" : "bg-green-500"}`} />
                          {order.status === OrderStatus.SHIPPING ? "Đang giao" : order.status}
                        </span>
                      </td>
                      <td className="px-4 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => onSelectOrder(order)} className="h-7 px-2.5 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 shadow-xs active:scale-95 whitespace-nowrap">Chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination UI - FIXED AT BOTTOM WITH INPUT */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t border-[#E5E7EB] px-5 flex items-center justify-between z-20 text-[12px] font-medium text-[#6B7280]">
              <div>{filteredOrders.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, filteredOrders.length)} / {filteredOrders.length} đơn</div>

              <div className="flex items-center gap-6">
                {/* Jump to page */}
                <div className="flex items-center gap-2 border-r border-[#E5E7EB] pr-6">
                  <span>Đi đến trang:</span>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const p = parseInt(jumpPage);
                          if (p >= 1 && p <= totalPages) {
                            setCurrentPage(p);
                            setJumpPage("");
                          }
                        }
                      }}
                      placeholder={currentPage.toString()}
                      className="w-10 h-7 border border-[#E5E7EB] rounded-l px-1 text-center text-[#111827] outline-none"
                    />
                    <button
                      onClick={() => {
                        const p = parseInt(jumpPage);
                        if (p >= 1 && p <= totalPages) {
                          setCurrentPage(p);
                          setJumpPage("");
                        }
                      }}
                      className="h-7 px-2 bg-[#FAFAFA] border border-l-0 border-[#E5E7EB] rounded-r text-[10px] font-bold hover:bg-neutral-100"
                    >
                      GO
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span>Hiện:</span>
                  <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="h-7 border border-[#E5E7EB] rounded px-1 text-[#111827] font-bold bg-white outline-none cursor-pointer">
                    <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="w-7 h-7 flex items-center justify-center rounded border border-[#E5E7EB] hover:bg-neutral-50 disabled:opacity-25">&lt;&lt;</button>

                  {/* Numeric Pages */}
                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && p - arr[i-1] > 1 && <span className="px-1 text-neutral-300">...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`w-7 h-7 flex items-center justify-center rounded transition-all font-bold ${currentPage === p ? "bg-[#6c5e06] text-white shadow-sm" : "hover:bg-neutral-50 border border-transparent"}`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))
                    }
                  </div>

                  <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} className="w-7 h-7 flex items-center justify-center rounded border border-[#E5E7EB] hover:bg-neutral-50 disabled:opacity-25">&gt;&gt;</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
