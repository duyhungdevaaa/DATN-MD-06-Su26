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

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Helper to parse DD/MM/YYYY to Date object
  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // month is 0-indexed
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(NaN);
  };

  // Filters logic
  const filteredOrders = orders.filter((order) => {
    // Search filter
    const term = searchText.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      order.id.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      order.phone.toLowerCase().includes(term);

    // Status filter
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    // Payment filter
    const matchesPayment = paymentFilter === "All" || order.paymentMethod === paymentFilter;

    // Date range filter
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

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-50 text-amber-600 border-amber-100";
      case OrderStatus.SHIPPING:
        return "bg-orange-50 text-orange-600 border-orange-100";
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-600 border-green-100";
      case OrderStatus.CANCELLED:
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-neutral-50 text-neutral-500 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[32px] font-bold text-[#111827] tracking-[-0.5px] mb-[6px]">
            Bản ghi vận đơn & Giao dịch
          </h3>
          <p className="text-[15px] font-normal text-[#6B7280]">
            Quản lý và theo dõi trạng thái đơn hàng
          </p>
        </div>
        <button className="h-[40px] px-4 rounded-[10px] bg-[#6c5e06] hover:bg-[#5a4e05] text-white text-[15px] font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95">
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Excel
        </button>
      </div>

      {/* Filter Section Card */}
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          {/* Search Input */}
          <div className="md:col-span-2 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm kiếm mã đơn, khách hàng, SĐT..."
                className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] pl-[40px] pr-[14px] text-[14px] placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#6c5e06]/20 focus:border-[#6c5e06] outline-none transition-all"
              />
              <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider block">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[14px] text-[14px] text-[#111827] bg-[#F9FAFB] focus:bg-white outline-none transition-all cursor-pointer"
            >
              <option value="All">Tất cả</option>
              <option value={OrderStatus.PENDING}>Đang xử lý</option>
              <option value={OrderStatus.SHIPPING}>Đang giao</option>
              <option value={OrderStatus.DELIVERED}>Đã giao</option>
              <option value={OrderStatus.CANCELLED}>Đã hủy</option>
            </select>
          </div>

          {/* Payment Select */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider block">Phương thức TT:</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] px-[14px] text-[14px] text-[#111827] bg-[#F9FAFB] focus:bg-white outline-none transition-all cursor-pointer"
            >
              <option value="All">Tất cả</option>
              <option value="COD">COD</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>

          {/* Date Range - From */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider block">Từ ngày:</label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] pl-[14px] pr-[14px] text-[14px] text-[#111827] bg-white outline-none"
              />
            </div>
          </div>

          {/* Date Range - To */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider block">Đến ngày:</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-[44px] rounded-[10px] border border-[#E5E7EB] pl-[14px] pr-[14px] text-[14px] text-[#111827] bg-white outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-6 flex justify-end gap-3 mt-2">
            <button className="h-[40px] px-6 rounded-[10px] bg-[#6c5e06] hover:bg-[#5a4e05] text-white text-[15px] font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95">
              <Filter className="h-4 w-4" />
              Lọc
            </button>
            <button
              onClick={() => {
                setSearchText("");
                setStatusFilter("All");
                setPaymentFilter("All");
                setFromDate("");
                setToDate("");
              }}
              className="h-[40px] px-6 rounded-[10px] bg-white hover:bg-neutral-50 text-neutral-600 border border-[#E5E7EB] text-[15px] font-medium flex items-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Grid View */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-20 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
            <ShoppingBag className="h-8 w-8 text-neutral-300" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800">Không có dữ liệu</h3>
          <p className="text-[15px] text-[#6B7280] mt-2 max-w-sm mx-auto">
            Vui lòng thử gõ từ khóa tìm kiếm khác hoặc đổi bộ lọc trạng thái đơn hàng.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#6B7280] uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6 pl-8">Mã đơn hàng</th>
                  <th className="py-4 px-6">Thời gian đặt</th>
                  <th className="py-4 px-6">Khách hàng</th>
                  <th className="py-4 px-6">Sản phẩm</th>
                  <th className="py-4 px-6 text-right">Tổng tiền</th>
                  <th className="py-4 px-6">Phương thức TT</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 pr-8 text-center">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredOrders.map((order) => {
                  return (
                    <tr 
                      key={order.id} 
                      className="group hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* Code ID */}
                      <td className="py-[18px] px-6 pl-8 align-middle">
                        <span className="text-[15px] font-medium text-blue-600 tracking-tight uppercase hover:underline decoration-2 underline-offset-4">
                          #{order.id}
                        </span>
                      </td>

                      {/* Date Time */}
                      <td className="py-[18px] px-6 align-middle">
                        <span className="text-[15px] font-medium text-[#111827] block">
                          {order.date}
                        </span>
                        <span className="text-[14px] font-normal text-[#6B7280] block mt-0.5">
                          {order.time}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-[18px] px-6 align-middle">
                        <div className="flex flex-col gap-1">
                          <p className="text-[15px] font-medium text-[#111827] tracking-tight">
                            {order.customerName}
                          </p>
                          <div className="flex items-center gap-2 text-[14px] text-[#6B7280] font-normal">
                            <Phone className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            <span>{order.phone || "0901 234 567"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[14px] text-[#6B7280] font-normal">
                            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            <span className="truncate max-w-[150px]">{order.address || "Hà Nội"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Item Preview */}
                      <td className="py-[18px] px-6 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-[10px] overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0 shadow-sm">
                            <img
                              src={order.items[0]?.imageUrl}
                              alt={order.items[0]?.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-[15px] font-medium text-[#111827] truncate tracking-tight">
                              {order.items[0]?.name || "Áo polo"}
                            </p>
                            <span className="text-[14px] font-normal text-[#6B7280] block">
                              {order.items[0]?.size ? `Size ${order.items[0].size}` : "Size M"}
                              {order.items[0]?.color ? ` - ${order.items[0].color}` : " - Trắng"}
                            </span>
                            <span className="text-[14px] font-medium text-[#6B7280] block">
                              SL: {order.items[0]?.quantity || 1}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-[18px] px-6 align-middle text-right">
                        <strong className="text-[18px] font-bold text-[#111827] tracking-tight">
                          {formatVND(order.total)}
                        </strong>
                      </td>

                      {/* Payment */}
                      <td className="py-[18px] px-6 align-middle">
                        <span className="text-[15px] font-medium text-[#111827] block">
                          {order.paymentMethod || "Chuyển khoản"}
                        </span>
                        <span className="text-[14px] font-normal text-[#6B7280] block mt-0.5">
                          {order.paymentMethod === "COD" ? "Thanh toán khi nhận" : "Ngân hàng"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-[18px] px-6 align-middle text-center">
                        <span className={`inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full border text-[13px] font-semibold transition-all ${getStatusBadgeClass(order.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === OrderStatus.PENDING 
                              ? 'bg-amber-500'
                              : order.status === OrderStatus.SHIPPING 
                              ? "bg-orange-500"
                              : order.status === OrderStatus.CANCELLED
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`} />
                          {order.status === OrderStatus.SHIPPING ? "Đang giao" : order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-[18px] px-6 pr-8 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="h-9 px-4 text-[13px] font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-[10px] shadow-sm transition-all inline-flex items-center gap-2 active:scale-95 whitespace-nowrap"
                          >
                            <Eye className="h-4 w-4 opacity-70" />
                            Xem chi tiết
                          </button>
                          <button className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Matching Image */}
          <div className="px-8 py-4 border-t border-[#E5E7EB] flex items-center justify-between bg-white text-[14px] text-[#6B7280]">
            <div>Hiển thị 1 - 10 / 46 đơn hàng</div>
            <div className="flex items-center gap-1">
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E5E7EB] hover:bg-neutral-50 transition-all text-neutral-400">&lt;</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#6c5e06] text-white font-bold">1</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-50 transition-all">2</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-50 transition-all">3</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-50 transition-all">4</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:bg-neutral-50 transition-all">5</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E5E7EB] hover:bg-neutral-50 transition-all text-neutral-400">&gt;</button>
            </div>
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select className="border border-[#E5E7EB] rounded-md px-2 py-1 text-neutral-700 outline-none">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span>trên mỗi trang</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
