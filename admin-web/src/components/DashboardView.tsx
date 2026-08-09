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
  // Calculations
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

  const pendingOrders = filteredOrders.filter(o => o.status === "Đang xử lý");

  // Calculate Top Products
  const productSales: Record<string, { name: string; qty: number; rev: number; img: string }> = {};
  filteredOrders.filter(o => o.status !== "Đã hủy" && o.status !== "Trả hàng/Hoàn tiền").forEach(o => {
    o.items.forEach(item => {
      if (!productSales[item.id]) {
        productSales[item.id] = { name: item.name, qty: 0, rev: 0, img: item.imageUrl };
      }
      productSales[item.id].qty += item.quantity;
      productSales[item.id].rev += (item.quantity * item.price);
    });
  });
  
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Premium metrics
  const stats = [
    {
      id: "revenue",
      title: "Tổng Doanh Thu Lũy Kế",
      value: formatVND(totalRevenue),
      change: "+18.4%",
      isPositive: true,
      subtext: "Từ khởi đầu kỳ",
      icon: CircleDollarSign,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    },
    {
      id: "orders",
      title: "Khối Lượng Đơn Hàng",
      value: `${filteredOrders.length} Đơn hàng`,
      change: `+6.8%`,
      isPositive: true,
      subtext: `${pendingOrders.length} Đơn đang chờ xử lý`,
      icon: ShoppingBag,
      color: "bg-[#8c7623]/10 text-[#8c7623] border-[#8c7623]/20"
    },
    {
      id: "users",
      title: "Thành Viên Độc Quyền",
      value: `${users.length} Hội viên`,
      change: "Hạng VIP Gold",
      isPositive: true,
      subtext: `${users.filter(u => u.tier === "GOLD").length} khách hàng VIP Gold`,
      icon: Award,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    }
  ];

  // Live premium system events
  const recentEvents = orders
    .slice(0, 5)
    .map(o => {
      let actionText = "đã đặt một đơn hàng mới";
      let badgeLabel = "Đơn hàng mới";
      let colorClass = "text-sky-600 bg-sky-50";

      if (o.status === "Đang xử lý") {
        actionText = "vừa tạo yêu cầu mua sắm";
        badgeLabel = "Chờ duyệt";
        colorClass = "text-amber-600 bg-amber-50";
      } else if (o.status === "Đã giao") {
        actionText = "đã nhận được kiện hàng thành công";
        badgeLabel = "Hoàn tất";
        colorClass = "text-green-600 bg-green-50";
      } else if (o.status === "Đã hủy") {
        actionText = "đã hủy giao dịch";
        badgeLabel = "Đã hủy";
        colorClass = "text-rose-600 bg-rose-50";
      }

      return {
        user: o.customerName,
        action: actionText,
        time: o.date,
        badge: badgeLabel,
        color: colorClass
      };
    });

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
  const barWidth = 24;
  const xPositions = [45, 125, 205, 285, 365, 445, 525];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Editorial Greetings Banner */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 text-white p-8 rounded-2xl border-none shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(140,118,35,0.15),transparent_45%)] pointer-events-none" />
        
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#8c7623]" />
            <span className="font-sans text-[9px] tracking-[0.25em] text-[#8c7623] uppercase font-bold">
              Bảng quản trị tối cao
            </span>
          </div>
          <h2 className="font-sans text-2xl tracking-tight text-white uppercase mt-2.5 font-bold">
            Cảm hứng Sáng tạo <span className="text-[#8c7623]">Trendify v1.0</span>
          </h2>
          <p className="font-sans text-[14px] text-zinc-400 mt-2.5 max-w-2xl leading-relaxed font-normal">
            Nơi kết tinh dịch vụ may đo thời trang Haute Couture cùng hệ thống quản lý dữ liệu bán hàng trực quan. 
            Mọi sửa đổi tồn kho hay cập nhật trạng thái hóa đơn sẽ ngay lập tức có hiệu lực trên toàn chuỗi boutique.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            onClick={() => onNavigateToTab("products")}
            className="font-sans text-[11px] font-bold tracking-widest text-white uppercase border border-zinc-700 px-5 py-3 rounded-xl hover:bg-zinc-800 transition-all duration-200"
          >
            Quản lý kho
          </button>
          <button 
            onClick={() => onNavigateToTab("orders")}
            className="font-sans text-[11px] font-bold tracking-widest text-zinc-950 uppercase bg-white px-5 py-3 rounded-xl hover:bg-[#8c7623] hover:text-white transition-all duration-200 shadow-xl shadow-white/5"
          >
            Danh sách đơn hàng
          </button>
        </div>
      </section>

      {/* Date Filter & Actions */}
      <section className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Lọc theo thời gian:</span>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-[12px] font-bold border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-800 outline-none focus:border-[#8c7623] bg-zinc-50/50"
          />
          <span className="text-zinc-300">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-[12px] font-bold border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-800 outline-none focus:border-[#8c7623] bg-zinc-50/50"
          />
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="text-[10px] text-rose-500 hover:text-rose-600 ml-2 font-bold uppercase tracking-widest"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </section>

      {/* Numerical Insights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="text-left">
                  <p className="font-sans text-[11px] font-semibold text-zinc-400 tracking-[0.15em] uppercase">
                    {stat.title}
                  </p>
                  <p className="font-sans text-2xl font-semibold text-zinc-950 mt-2 tracking-tighter">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color} shadow-xs`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-50">
                <span className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  stat.isPositive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                }`}>
                  {stat.change}
                </span>
                <span className="font-sans text-[12px] text-zinc-400 font-normal">
                  {stat.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Structural Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Flow */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm text-left">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="font-sans text-lg text-zinc-950 font-bold tracking-tight">
                  Hiệu suất dòng tiền giao dịch
                </h4>
                <p className="font-sans text-[12px] text-zinc-400 mt-1 font-normal">
                  Thống kê doanh số bán ra theo thứ trong tuần (VNĐ)
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
                <span className="w-2 h-2 rounded-full bg-[#8c7623] shadow-sm" />
                <span className="text-[10px] font-sans text-zinc-600 font-bold uppercase tracking-widest">Doanh số thực</span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-44 w-full">
              <svg viewBox="0 0 570 160" className="w-full h-full overflow-visible">
                <line x1="30" y1="10" x2="570" y2="10" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="30" y1="50" x2="570" y2="50" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="30" y1="90" x2="570" y2="90" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="30" y1="130" x2="570" y2="130" stroke="#e4e4e7" strokeWidth="1.5" />

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
                          fill="url(#goldGradient)" 
                          rx="3"
                          ry="3"
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      )}
                      <text x={xPos} y="152" textAnchor="middle" className="font-sans text-[10px] fill-zinc-400 font-bold uppercase tracking-tighter">{data.label}</text>
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8c7623" />
                    <stop offset="100%" stopColor="#27272a" />
                  </linearGradient>
                </defs>

                <text x="12" y="12" textAnchor="middle" className="font-sans text-[9px] fill-zinc-300 font-bold">{formatShortValue(maxChartValue)}</text>
                <text x="12" y="133" textAnchor="middle" className="font-sans text-[9px] fill-zinc-300 font-bold">0</text>
              </svg>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm text-left">
            <h4 className="font-sans text-lg text-zinc-950 font-bold tracking-tight mb-8">
              Top Sản Phẩm Bán Chạy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topProducts.length > 0 ? topProducts.map((prod, idx) => (
                <div key={idx} className="flex gap-4 items-center p-4 rounded-xl border border-zinc-50 bg-zinc-50/30 hover:bg-white hover:border-zinc-200 transition-all group">
                  <div className="w-12 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-zinc-100 shadow-xs group-hover:scale-105 transition-transform">
                    <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-zinc-900 font-bold truncate leading-tight uppercase tracking-tight">{prod.name}</p>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-1.5 uppercase tracking-widest">
                      Đã bán: <span className="text-[#8c7623]">{prod.qty}</span>
                    </p>
                    <p className="text-[14px] font-semibold text-zinc-950 mt-1">{formatVND(prod.rev)}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 font-semibold text-xs">
                    {idx + 1}
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center text-zinc-400 text-xs py-8 italic font-medium">Hệ thống chưa có dữ liệu bán hàng</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-8 text-left">
          {/* Active Orders List */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-sans text-base text-zinc-950 font-bold tracking-tight">
                Đơn hàng live
              </h4>
              <button
                onClick={() => onNavigateToTab("orders")}
                className="text-[10px] text-[#8c7623] hover:underline flex items-center gap-1 font-bold uppercase tracking-widest"
              >
                Tất cả <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => {
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      onSelectOrder(order);
                      onNavigateToTab("orders");
                    }}
                    className="p-3.5 border border-zinc-50 bg-zinc-50/20 rounded-xl hover:bg-white hover:border-[#8c7623]/20 hover:shadow-lg hover:shadow-black/5 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white ring-2 ring-zinc-100/50 shadow-xs">
                        <img
                          src={order.customerAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-zinc-900 truncate max-w-[100px] leading-none uppercase tracking-tighter">
                          {order.customerName}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-semibold block mt-1.5 uppercase tracking-tighter">
                          #{order.id.substring(0, 6)} • {order.items.length} món
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-zinc-950 tracking-tighter">
                        {formatVND(order.total)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System event feeds log */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h4 className="font-sans text-base text-zinc-950 font-bold tracking-tight mb-6 uppercase">
              Nhật ký live
            </h4>
            <div className="space-y-6">
              {orders.slice(0, 5).map((o, idx) => (
                <div key={idx} className="flex gap-4 text-left">
                  <div className="mt-1">
                    <span className="w-1.5 h-1.5 block rounded-full bg-[#8c7623] animate-pulse shadow-[0_0_8px_#8c7623]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-zinc-800 leading-snug font-normal">
                      <strong className="text-zinc-950 font-bold uppercase tracking-tight">{o.customerName}</strong> đã thực hiện giao dịch
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-tighter">
                        {o.date}
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-lg border text-sky-600 bg-sky-50`}>
                        {o.status}
                      </span>
                    </div>
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
