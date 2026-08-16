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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(searchText.toLowerCase()) || i.sku.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Header & filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Quản lý đơn hàng</h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-600">Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-medium"
          >
            <option value="All">Tất cả ({orders.length})</option>
            <option value={OrderStatus.AWAITING_PAYMENT}>Chờ xác nhận</option>
            <option value={OrderStatus.PROCESSING}>Đang xử lý</option>
            <option value={OrderStatus.SHIPPING}>Đang giao hàng</option>
            <option value={OrderStatus.DELIVERED}>Đã giao hàng</option>
            <option value={OrderStatus.REFUNDED}>Trả hàng/Hoàn tiền</option>
            <option value={OrderStatus.REFUND_COMPLETED}>Đã hoàn tiền</option>
            <option value={OrderStatus.CANCELLED}>Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-xs">
          <ShoppingBag className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700">Không tìm thấy đơn hàng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Mã đơn</th>
                  <th className="py-3 px-3">Thời gian</th>
                  <th className="py-3 px-3">Người đặt (Tài khoản)</th>
                  <th className="py-3 px-3">Người nhận & SĐT</th>
                  <th className="py-3 px-3">Địa chỉ nhận</th>
                  <th className="py-3 px-3">Thanh toán</th>
                  <th className="py-3 px-3 text-right">Tổng tiền</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((order) => {
                  let statusBadge = "bg-zinc-100 text-zinc-700 border-zinc-200";
                  if (order.status === OrderStatus.AWAITING_PAYMENT || order.status === OrderStatus.PROCESSING) {
                    statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                  } else if (order.status === OrderStatus.SHIPPING) {
                    statusBadge = "bg-sky-50 text-sky-700 border-sky-200";
                  } else if (order.status === OrderStatus.DELIVERED) {
                    statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  } else if (order.status === OrderStatus.REFUND_COMPLETED) {
                    statusBadge = "bg-teal-50 text-teal-700 border-teal-200";
                  } else if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
                    statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
                  }

                  const ordererName = order.ordererName || order.customerName || "Khách hàng";
                  const recipientName = order.recipientName || ordererName;
                  const displayPhone = (order.recipientPhone || order.phone || "").trim() || "Chưa có SĐT";
                  const displayAddress = order.recipientAddress || order.address || "Tại cửa hàng";

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      {/* Mã đơn hàng */}
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="font-mono text-xs font-bold text-zinc-900 hover:text-blue-600 hover:underline cursor-pointer block text-left"
                          title="Nhấp để xem chi tiết đơn hàng"
                        >
                          #{order.id.length > 8 ? order.id.substring(0, 8) + '...' : order.id}
                        </button>
                      </td>

                      {/* Thời gian đặt */}
                      <td className="py-2.5 px-3 text-xs text-zinc-600 whitespace-nowrap">
                        {order.date} <span className="text-[10px] text-zinc-400 block">{order.time || ""}</span>
                      </td>

                      {/* Người đặt */}
                      <td className="py-2.5 px-3 text-xs">
                        <p className="font-bold text-zinc-900">{ordererName}</p>
                        {order.email && <p className="text-[10px] text-zinc-400 truncate max-w-[130px]">{order.email}</p>}
                      </td>

                      {/* Người nhận & SĐT */}
                      <td className="py-2.5 px-3 text-xs">
                        <p className="font-semibold text-zinc-800">{recipientName}</p>
                        <p className="font-mono text-[11px] text-zinc-500">{displayPhone}</p>
                      </td>

                      {/* Địa chỉ giao hàng */}
                      <td className="py-2.5 px-3 text-xs text-zinc-600 max-w-[180px] truncate" title={displayAddress}>
                        {displayAddress}
                      </td>

                      {/* Phương thức thanh toán */}
                      <td className="py-2.5 px-3 text-xs font-medium text-zinc-800">
                        {order.paymentMethod || "COD (Thanh toán khi nhận hàng)"}
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-2.5 px-3 text-right font-semibold text-zinc-900 text-xs whitespace-nowrap">
                        {formatVND(order.total)}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Chi tiết
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

