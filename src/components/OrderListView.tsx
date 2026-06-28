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
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Search and control filter line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow">
        <div>
          <h3 className="font-serif text-lg text-neutral-900 font-medium font-medium font-medium">Bản ghi vận đơn & Giao dịch</h3>
          <p className="font-sans text-xs text-neutral-400 mt-1">
            Ghi nhận trạng thái hoàn thiện sản hóa Haute Couture, theo dõi thời trình giao nhận thông qua Giao Hàng Tiết Kiệm (GHTK).
          </p>
        </div>

        {/* Status filters selection dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Bộ trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#6c5e06] focus:outline-none focus:bg-white font-sans text-neutral-700"
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
        <div className="bg-white rounded-xl border border-[#cfc4c5]/30 p-16 text-center custom-shadow">
          <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="font-serif text-lg text-neutral-800 font-medium">Không tìm thấy mã đơn hàng phù hợp</h3>
          <p className="font-sans text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
            Vui lòng thử gõ từ khóa tìm kiếm khác hoặc đổi bộ lọc trạng thái đơn hàng.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#cfc4c5]/30 custom-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fbf9f9] border-b border-neutral-100 font-sans text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                  <th className="p-5 pl-8">Mã vận đơn (ID)</th>
                  <th className="p-5">Thượng khách</th>
                  <th className="p-5">Chi tiết sản phẩm dệt may</th>
                  <th className="p-5 text-right">Tổng thanh toán</th>
                  <th className="p-5 text-center">Trạng thái vận đơn</th>
                  <th className="p-5 pr-8 text-center">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.map((order) => {
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-[#6c5e06]/5/20 transition-all cursor-pointer font-sans"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* Code ID */}
                      <td className="p-5 pl-8 vertical-align-middle">
                        <span className="font-mono text-xs font-bold text-[#1b1c1c] tracking-wider uppercase block">
                          #{order.id}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-1">
                          {order.date} • {order.time}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-5 vertical-align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full overflow-hidden ring-2 ring-neutral-100/50 bg-neutral-100 shrink-0">
                            <img 
                              src={order.customerAvatar} 
                              alt={order.customerName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-800 leading-none">
                              {order.customerName}
                            </p>
                            <span className="text-[10px] text-neutral-400 mt-1 block tracking-tight truncate max-w-[140px]">
                              {order.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Items previews summary */}
                      <td className="p-5 vertical-align-middle">
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
                            <p className="text-xs font-bold text-neutral-800 truncate leading-none">
                              {order.items[0]?.name || "Đang dệt may..."}
                            </p>
                            <span className="text-[9px] text-neutral-400 mt-1 block">
                              {order.items.length > 1 ? `và ${order.items.length - 1} áo quần phụ kiện khác` : `Mã hàng: ${order.items[0]?.sku || "-"}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Calculations total sum block */}
                      <td className="p-5 vertical-align-middle text-right">
                        <strong className="font-mono text-xs font-bold text-neutral-900 block">
                          {formatVND(order.total)}
                        </strong>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1 block">
                          {order.paymentMethod || "Visa Premium"}
                        </span>
                      </td>

                      {/* Status design control */}
                      <td className="p-5 vertical-align-middle text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold ${getStatusBadgeClass(order.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === OrderStatus.PENDING 
                              ? 'bg-amber-500' 
                              : order.status === OrderStatus.SHIPPING 
                              ? "bg-sky-500" 
                              : order.status === OrderStatus.CANCELLED
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`} />
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5 vertical-align-middle pr-8 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 px-3 text-[10px] font-bold uppercase tracking-wider font-sans rounded-lg bg-neutral-100 hover:bg-[#6c5e06]/10 text-neutral-600 hover:text-[#6c5e06] border border-neutral-200 transition-colors duration-200 inline-flex items-center gap-1.5"
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
