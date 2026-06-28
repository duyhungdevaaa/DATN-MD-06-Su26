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
  UserCheck
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderListViewProps {
  orders: Order[];
  searchText: string;
  onSelectOrder: (order: Order) => void;
}

export const OrderListView: React.FC<OrderListViewProps> = ({
  orders,
  searchText,
  onSelectOrder
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Filters logic
  const filteredOrders = orders.filter((order) => {
    // Search filter matches against code, name, phone, or sku inside items
    const matchesSearch = 
      order.id.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(searchText.toLowerCase()) || i.sku.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case OrderStatus.SHIPPING:
        return "bg-sky-50 text-sky-700 border-sky-200/50";
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-700 border-green-200/50";
      default:
        return "bg-neutral-100 text-neutral-500 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Search and control filter line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div>
          <h3 className="font-serif text-lg text-zinc-900 font-bold">Bản ghi vận đơn & Giao dịch</h3>
          <p className="font-sans text-xs text-zinc-400 mt-1">
            Ghi nhận trạng thái hoàn thiện sản hóa Haute Couture, theo dõi thời trình giao nhận thông qua Giao Hàng Tiết Kiệm (GHTK).
          </p>
        </div>

        {/* Status filters selection dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Bộ trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none focus:bg-white font-sans text-zinc-700 font-bold"
          >
            <option value="All">Tất cả vận đơn</option>
            <option value={OrderStatus.PENDING}>Đang xử lý ({orders.filter(o => o.status === OrderStatus.PENDING).length})</option>
            <option value={OrderStatus.SHIPPING}>Đang giao ({orders.filter(o => o.status === OrderStatus.SHIPPING).length})</option>
            <option value={OrderStatus.DELIVERED}>Đã hoàn thành ({orders.filter(o => o.status === OrderStatus.DELIVERED).length})</option>
            <option value={OrderStatus.CANCELLED}>Đã hủy ({orders.filter(o => o.status === OrderStatus.CANCELLED).length})</option>
          </select>
        </div>
      </div>

      {/* Main Table Grid View */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-16 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4">
            <ShoppingBag className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="font-serif text-lg text-zinc-800 font-medium">Không tìm thấy mã đơn hàng phù hợp</h3>
          <p className="font-sans text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Vui lòng thử gõ từ khóa tìm kiếm khác hoặc đổi bộ lọc trạng thái đơn hàng.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden">
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
                {filteredOrders.map((order) => {
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
        </div>
      )}

    </div>
  );
};
