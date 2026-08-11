/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  CircleDollarSign, 
  ShoppingBag, 
  Award, 
  Sparkles, 
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { Product, Order, User } from "../types";

interface DashboardViewProps {
  products: Product[];
  orders: Order[];
  users: User[];
  onNavigateToTab: (tab: any) => void;
  onSelectOrder: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  orders,
  users,
  onNavigateToTab,
  onSelectOrder
}) => {
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredOrders = orders.filter(o => {
    if (!startDate && !endDate) return true;
    try {
      const datePart = o.date.split(" ")[0];
      let dStr = datePart;
      if (datePart.includes("/")) {
        const [day, month, year] = datePart.split("/");
        dStr = `${year}-${month}-${day}`;
      }
      const oDate = new Date(dStr).getTime();
      const sDate = startDate ? new Date(startDate).getTime() : 0;
      const eDate = endDate ? new Date(endDate).getTime() : Infinity;
      return oDate >= sDate && oDate <= eDate;
    } catch {
      return true;
    }
  });

  const totalRevenue = filteredOrders
    .filter(o => o.status !== "Đã hủy" && o.status !== "Trả hàng/Hoàn tiền")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = filteredOrders.filter(o => o.status === "Đang xử lý" || o.status === "Chờ xác nhận");
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const stats = [
    {
      id: "revenue",
      title: "Tổng doanh thu",
      value: formatVND(totalRevenue),
      subtext: "Doanh số thực tế",
      icon: CircleDollarSign,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "orders",
      title: "Khối lượng đơn hàng",
      value: `${filteredOrders.length} đơn`,
      subtext: `${pendingOrders.length} đơn chờ duyệt`,
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
      id: "products",
      title: "Tổng số sản phẩm",
      value: `${products.length} sản phẩm`,
      subtext: `${lowStockProducts.length} sản phẩm sắp hết hàng`,
      icon: TrendingUp,
      color: "bg-sky-50 text-sky-700 border-sky-200"
    },
    {
      id: "users",
      title: "Khách hàng",
      value: `${users.length} tài khoản`,
      subtext: "Đã đăng ký hệ thống",
      icon: Award,
      color: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ];

  // Revenue chart calculation
  const revenueByDay = [0, 0, 0, 0, 0, 0, 0];
  filteredOrders.filter(o => o.status !== "Đã hủy").forEach(o => {
    try {
      const datePart = o.date.split(" ")[0];
      const [day, month, year] = datePart.split("/");
      if (day && month && year) {
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime())) {
          revenueByDay[dateObj.getDay()] += o.total;
        }
      }
    } catch (e) {}
  });

  const chartData = [
    { label: "T2", value: revenueByDay[1] },
    { label: "T3", value: revenueByDay[2] },
    { label: "T4", value: revenueByDay[3] },
    { label: "T5", value: revenueByDay[4] },
    { label: "T6", value: revenueByDay[5] },
    { label: "T7", value: revenueByDay[6] },
    { label: "CN", value: revenueByDay[0] },
  ];

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1000000);
  const formatShortValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace(".0", "") + "M";
    if (val >= 1000) return (val / 1000).toFixed(0) + "K";
    return val.toString();
  };

  const chartHeight = 120;
  const chartYOffset = 10;
  const barWidth = 28;
  const xPositions = [45, 125, 205, 285, 365, 445, 525];

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Tổng quan kinh doanh</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Báo cáo doanh số và hoạt động bán hàng theo thời gian thực</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-700 outline-none focus:border-zinc-900"
          />
          <span className="text-zinc-400 text-xs">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-700 outline-none focus:border-zinc-900"
          />
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">{stat.title}</p>
                  <p className="text-xl font-bold text-zinc-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-3 pt-2 border-t border-zinc-100 font-medium">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Doanh số theo tuần</h3>
              <p className="text-xs text-zinc-500">Doanh thu thống kê theo các ngày trong tuần</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-xs bg-zinc-900" />
              <span>VNĐ</span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full pt-4">
            <svg viewBox="0 0 570 160" className="w-full h-full overflow-visible">
              <line x1="30" y1="10" x2="570" y2="10" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="30" y1="50" x2="570" y2="50" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="30" y1="90" x2="570" y2="90" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="30" y1="130" x2="570" y2="130" stroke="#e4e4e7" strokeWidth="1" />

              {chartData.map((data, index) => {
                const barH = (data.value / maxChartValue) * chartHeight;
                const xPos = xPositions[index];
                const yPos = chartYOffset + chartHeight - barH;
                return (
                  <g key={index}>
                    {barH > 0 && (
                      <rect 
                        x={xPos - barWidth/2} 
                        y={yPos} 
                        width={barWidth} 
                        height={barH} 
                        fill="#18181b" 
                        rx="4" 
                        ry="4"
                      />
                    )}
                    <text x={xPos} y="148" textAnchor="middle" className="text-[10px] fill-zinc-500 font-semibold">{data.label}</text>
                    {barH > 0 && (
                      <text x={xPos} y={yPos - 5} textAnchor="middle" className="text-[9px] fill-zinc-600 font-bold">
                        {formatShortValue(data.value)}
                      </text>
                    )}
                  </g>
                );
              })}

              <text x="15" y="12" textAnchor="middle" className="text-[9px] fill-zinc-400 font-medium">{formatShortValue(maxChartValue)}</text>
              <text x="15" y="52" textAnchor="middle" className="text-[9px] fill-zinc-400 font-medium">{formatShortValue(maxChartValue * 2 / 3)}</text>
              <text x="15" y="92" textAnchor="middle" className="text-[9px] fill-zinc-400 font-medium">{formatShortValue(maxChartValue / 3)}</text>
              <text x="15" y="133" textAnchor="middle" className="text-[9px] fill-zinc-400 font-medium">0</text>
            </svg>
          </div>
        </div>

        {/* Right Column: Low Stock Alert & Recent Orders */}
        <div className="space-y-6">
          {/* Low Stock Warning */}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Cảnh báo sắp hết hàng</span>
                <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">{lowStockProducts.length}</span>
              </div>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-amber-100">
                    <span className="font-semibold text-zinc-900 truncate max-w-[150px]">{prod.name}</span>
                    <span className="text-amber-700 font-bold">Còn {prod.stock} sp</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Đơn hàng vừa đặt</h3>
              <button 
                onClick={() => onNavigateToTab("orders")}
                className="text-xs text-zinc-600 hover:text-zinc-900 font-semibold"
              >
                Xem tất cả &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredOrders.slice(0, 4).map((order) => (
                <div 
                  key={order.id}
                  onClick={() => {
                    onSelectOrder(order);
                    onNavigateToTab("orders");
                  }}
                  className="p-3 border border-zinc-100 hover:border-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 truncate max-w-[120px]">{order.customerName}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">#{order.id.substring(0, 6)} • {order.items.length} món</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-900">{formatVND(order.total)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      order.status === "Đang xử lý" || order.status === "Chờ xác nhận"
                        ? "bg-amber-50 text-amber-700" 
                        : order.status === "Đang vận chuyển" 
                        ? "bg-sky-50 text-sky-700" 
                        : order.status === "Đã hủy"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

