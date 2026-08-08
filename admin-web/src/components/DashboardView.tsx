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
      const datePart = o.date.split(" ")[0]; // "DD/MM/YYYY" or "YYYY-MM-DD" depending on how date was stored
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
  const shippingOrders = filteredOrders.filter(o => o.status === "Đang vận chuyển");

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

  // Live premium system events (derived from real orders)
  const recentEvents = orders
    .slice(0, 5) // Get latest 5
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

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
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
  const xPositions = [45, 125, 205, 285, 365, 445, 525]; // 7 points

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Editorial Greetings Banner */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 text-white p-8 rounded-2xl border-none shadow-lg relative overflow-hidden">
        {/* Subtle mesh background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(140,118,35,0.15),transparent_45%)] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#8c7623]" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#8c7623] uppercase font-bold">
              Bảng quản trị tối cao
            </span>
          </div>
<<<<<<< HEAD
          <h2 className="font-sans text-3.5xl tracking-normal text-[#1b1c1c] uppercase mt-2.5 font-bold">
            Cảm hứng Sáng tạo <span className="font-sans font-bold italic text-[#6c5e06]">Trendify v1.0</span>
          </h2>
          <p className="font-sans text-xs text-neutral-500 mt-2.5 max-w-2xl leading-relaxed font-medium">
=======
          <h2 className="font-serif text-3xl tracking-normal text-white uppercase mt-2.5 font-light">
            Cảm hứng Sáng tạo <span className="font-normal italic text-[#8c7623]">Trendify v1.0</span>
          </h2>
          <p className="font-sans text-xs text-zinc-400 mt-2.5 max-w-2xl leading-relaxed">
>>>>>>> origin/main
            Nơi kết tinh dịch vụ may đo thời trang Haute Couture cùng hệ thống quản lý dữ liệu bán hàng trực quan. 
            Mọi sửa đổi tồn kho hay cập nhật trạng thái hóa đơn sẽ ngay lập tức có hiệu lực trên toàn chuỗi boutique.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            onClick={() => onNavigateToTab("products")}
<<<<<<< HEAD
            className="font-sans text-[11px] font-semibold tracking-widest text-[#1b1c1c] uppercase border border-neutral-300 px-5 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200"
=======
            className="font-sans text-[11px] font-bold tracking-widest text-white uppercase border border-zinc-700 px-5 py-3 rounded-xl hover:bg-zinc-800 hover:border-zinc-650 transition-all duration-200"
>>>>>>> origin/main
          >
            Quản lý kho
          </button>
          <button 
            onClick={() => onNavigateToTab("orders")}
<<<<<<< HEAD
            className="font-sans text-[11px] font-semibold tracking-widest text-white uppercase bg-[#1b1c1c] px-5 py-3 rounded-lg hover:bg-[#6c5e06] transition-all duration-200"
=======
            className="font-sans text-[11px] font-bold tracking-widest text-zinc-950 uppercase bg-white px-5 py-3 rounded-xl hover:bg-[#8c7623] hover:text-white transition-all duration-200"
>>>>>>> origin/main
          >
            Danh sách đơn hàng
          </button>
        </div>
      </section>

      {/* Date Filter & Actions */}
      <section className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200/50 shadow-sm">
        <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Lọc theo thời gian:</span>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 outline-none focus:border-[#8c7623]"
          />
          <span className="text-zinc-400">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 outline-none focus:border-[#8c7623]"
          />
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="text-xs text-rose-500 hover:text-rose-600 ml-2 font-bold uppercase tracking-wider"
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
              className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-sans text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
                    {stat.title}
                  </p>
<<<<<<< HEAD
                  <p className="font-sans text-2xl font-bold text-neutral-900 mt-2">
=======
                  <p className="font-serif text-2xl font-bold text-zinc-900 mt-2">
>>>>>>> origin/main
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100">
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stat.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {stat.change}
                </span>
<<<<<<< HEAD
                <span className="font-sans text-[10px] text-neutral-400 font-medium">
=======
                <span className="font-sans text-[10px] text-zinc-400">
>>>>>>> origin/main
                  {stat.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Structural Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Brand Editorial Statement Card (Left Panel) */}
        <div className="lg:col-span-2 space-y-6">
<<<<<<< HEAD
          <div className="bg-white p-8 rounded-xl border border-[#cfc4c5]/30 custom-shadow relative overflow-hidden flex flex-col justify-between h-[360px]">
            {/* Background texture vignette */}
            <div className="absolute inset-0 bg-radial-gradient opacity-[0.03] pointer-events-none" />
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-neutral-100/50 flex items-center justify-center p-4 border-l border-[#cfc4c5]/20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoLklNtWvITwVOoqtdsbjlVD-5T_fe1UPOoZEHsS2slRQuueWeZFhXFFCmEsQ2bViK0YXPWacCXVV1W6zRtD-qU8Lp0vCDk15RxppF3PoayJfv-aJzyssg5s0od8gcCMGu6AyXLdpxsut1SpLsk6FMtWOD2L6oBOcxhrbFeGF92EvZXx6GkZh_vkp9Y1UfiC0gvdKyNOiSe7stievshgk_pNhudW6WZ1kJuAb2cwN6AZjD-euYfrauA9SndEId8EFpChzPln9Fm4Y" 
                alt="Luxury Fabric Curation" 
                className="w-full h-full object-cover rounded-md editorial-img hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="w-2/3 pr-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#6c5e06] font-semibold tracking-widest font-mono uppercase">
                  Philosophy & Craft
                </span>
              </div>
              <h3 className="font-sans text-2xl tracking-tight text-[#1b1c1c] leading-snug font-bold">
                “Sự cân bằng của sự hoàn hảo nằm ở tâm huyết trong từng đường may sợi chỉ.”
              </h3>
              <p className="font-sans text-[11px] text-neutral-500 leading-relaxed font-medium">
                Tại Trendify, chúng tôi định nghĩa trải nghiệm thượng lưu qua tính nguyên bản và độ tinh xảo của sản phẩm. 
                Từng chiếc áo Silk, từng đôi giày Terra Chelsea đều trải qua hàng trăm công đoạn thủ công trước khi xuất hiện trên sảnh trưng bày.
              </p>
              
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <p className="font-sans text-xs font-bold text-neutral-800">420 chiếc</p>
                  <p className="font-sans text-[10px] text-neutral-400 font-medium">Sản xuất giới hạn</p>
                </div>
                <div>
                  <p className="font-sans text-xs font-bold text-neutral-800">100%</p>
                  <p className="font-sans text-[10px] text-neutral-400 font-medium">Premium Silk & Leather</p>
                </div>
                <div>
                  <p className="font-sans text-xs font-bold text-neutral-800">Cơ sở</p>
                  <p className="font-sans text-[10px] text-neutral-400 font-medium">Quận 1, TP. HCM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Flow (Pure Visual Metric Graph inside elegant block) */}
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-sans text-lg text-neutral-900 font-bold">
                  Hiệu suất dòng tiền giao dịch
                </h4>
                <p className="font-sans text-[10px] text-neutral-400 font-medium">
                  Thống kê doanh số bán ra theo tuần của kỳ hiện hành (triệu VNĐ)
=======
          {/* Performance Flow */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm text-left hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-serif text-lg text-zinc-900 font-medium">
                  Hiệu suất dòng tiền giao dịch
                </h4>
                <p className="font-sans text-[10px] text-zinc-400 mt-0.5">
                  Thống kê doanh số bán ra theo thứ trong tuần (VNĐ)
>>>>>>> origin/main
                </p>
              </div>
              <div className="flex items-center gap-4 font-sans font-medium text-[10px] text-neutral-500">
                <div className="flex items-center gap-1.5">
<<<<<<< HEAD
                  <span className="w-2 h-2 rounded-full bg-[#6c5e06]" />
                  <span>Doanh số thực</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-200" />
                  <span>Dự kiến bám rượt</span>
=======
                  <span className="w-2 h-2 rounded-sm bg-[#8c7623]" />
                  <span className="text-[10px] font-sans text-zinc-500 font-semibold">Doanh số thực</span>
>>>>>>> origin/main
                </div>
              </div>
            </div>

<<<<<<< HEAD
            {/* Custom SVG Line Chart */}
            <div className="h-44 w-full font-sans font-medium">
              <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
=======
            {/* Custom SVG Bar Chart */}
            <div className="h-44 w-full">
              <svg viewBox="0 0 570 160" className="w-full h-full overflow-visible">
>>>>>>> origin/main
                {/* Grid Lines */}
                <line x1="30" y1="10" x2="570" y2="10" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="50" x2="570" y2="50" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="90" x2="570" y2="90" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="130" x2="570" y2="130" stroke="#e4e4e7" strokeWidth="1" />

                {/* Bars */}
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
                          rx="4" 
                          ry="4"
                          className="hover:opacity-80 transition-opacity"
                        />
                      )}
                      <text x={xPos} y="148" textAnchor="middle" className="font-mono text-[9px] fill-zinc-400 font-bold">{data.label}</text>
                      {barH > 0 && (
                        <text x={xPos} y={yPos - 5} textAnchor="middle" className="font-mono text-[8px] fill-zinc-500 font-bold">
                          {formatShortValue(data.value)}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8c7623" />
                    <stop offset="100%" stopColor="#d4af37" />
                  </linearGradient>
                </defs>

<<<<<<< HEAD
                {/* Labels */}
                <text x="30" y="148" textAnchor="middle" className="font-sans font-medium text-[9px] fill-neutral-400">T2</text>
                <text x="120" y="148" textAnchor="middle" className="font-sans font-medium text-[9px] fill-neutral-400">T3</text>
                <text x="210" y="148" textAnchor="middle" className="font-sans font-medium text-[9px] fill-neutral-400">T4</text>
                <text x="300" y="148" textAnchor="middle" className="font-sans font-medium text-[9px] fill-neutral-400">T5</text>
                <text x="390" y="148" textAnchor="middle" className="font-sans font-medium text-[9px] fill-neutral-400">T6</text>
                <text x="480" y="148" textAnchor="middle" className="font-sans font-medium text-[9px] fill-neutral-400">T7</text>
                <text x="580" y="148" textAnchor="middle" className="font-sans font-medium text-[9px] fill-neutral-400">CN</text>

                <text x="15" y="12" textAnchor="middle" className="font-sans font-medium text-[8px] fill-neutral-300">20M</text>
                <text x="15" y="52" textAnchor="middle" className="font-sans font-medium text-[8px] fill-neutral-300">10M</text>
                <text x="15" y="92" textAnchor="middle" className="font-sans font-medium text-[8px] fill-neutral-300">5M</text>
                <text x="15" y="133" textAnchor="middle" className="font-sans font-medium text-[8px] fill-neutral-300">0</text>
=======
                {/* Y-axis Labels */}
                <text x="15" y="12" textAnchor="middle" className="font-mono text-[8px] fill-zinc-300 font-bold">{formatShortValue(maxChartValue)}</text>
                <text x="15" y="52" textAnchor="middle" className="font-mono text-[8px] fill-zinc-300 font-bold">{formatShortValue(maxChartValue * 2 / 3)}</text>
                <text x="15" y="92" textAnchor="middle" className="font-mono text-[8px] fill-zinc-300 font-bold">{formatShortValue(maxChartValue / 3)}</text>
                <text x="15" y="133" textAnchor="middle" className="font-mono text-[8px] fill-zinc-300 font-bold">0</text>
>>>>>>> origin/main
              </svg>
            </div>
          </div>
        </div>

        {/* Live Client Order Action feed (Right Panel) */}
        <div className="space-y-6 text-left">
          {/* Active Orders List */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm flex flex-col justify-between h-[360px] hover:shadow-md transition-shadow duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
                <h4 className="font-sans text-lg text-neutral-900 font-bold">
=======
                <h4 className="font-serif text-lg text-zinc-900 font-medium">
>>>>>>> origin/main
                  Đơn hàng live
                </h4>
                <button 
                  onClick={() => onNavigateToTab("orders")}
                  className="text-[10px] text-[#8c7623] hover:underline flex items-center gap-1 font-sans font-bold uppercase tracking-wider"
                >
                  Tất cả <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {filteredOrders.slice(0, 4).map((order) => {
                  return (
                    <div 
                      key={order.id}
                      onClick={() => {
                        onSelectOrder(order);
                        onNavigateToTab("orders");
                      }}
                      className="p-3 border border-zinc-100 rounded-xl hover:border-[#8c7623]/30 hover:bg-zinc-50/50 cursor-pointer transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-full overflow-hidden bg-zinc-100 ring-2 ring-zinc-100">
                          <img 
                            src={order.customerAvatar} 
                            alt={order.customerName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-800 font-sans truncate max-w-[100px]">
                            {order.customerName}
                          </p>
<<<<<<< HEAD
                          <span className="font-sans text-[9px] text-neutral-400 block mt-0.5 font-medium">
                            ID: {order.id} • {order.items.length} món
=======
                          <span className="font-mono text-[9px] text-zinc-400 block mt-0.5">
                            #{order.id.substring(0, 6)} • {order.items.length} món
>>>>>>> origin/main
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
<<<<<<< HEAD
                        <p className="text-xs font-bold text-neutral-900 font-sans">
=======
                        <p className="text-xs font-bold text-zinc-900 font-mono">
>>>>>>> origin/main
                          {formatVND(order.total)}
                        </p>
                        <span className={`text-[9px] font-sans px-2.5 py-0.5 rounded-full inline-block mt-1 font-semibold ${
                          order.status === "Đang xử lý" 
                            ? "bg-amber-50 text-amber-700" 
                            : order.status === "Đang vận chuyển" 
                            ? "bg-sky-50 text-sky-700" 
                            : order.status === "Đã hủy"
                            ? "bg-rose-50 text-rose-705"
                            : "bg-emerald-50 text-emerald-705"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* System event feeds log */}
<<<<<<< HEAD
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow">
            <h4 className="font-sans text-lg text-neutral-900 font-bold mb-4">
=======
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h4 className="font-serif text-lg text-zinc-900 font-medium mb-4">
>>>>>>> origin/main
              Nhật ký hệ thống live
            </h4>
            <div className="space-y-4">
              {recentEvents.map((evt, idx) => (
                <div key={idx} className="flex gap-3 text-left">
                  <div className="mt-1.5">
                    <span className="w-1.5 h-1.5 block rounded-full bg-[#8c7623] animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-700 leading-relaxed font-sans font-medium">
                      <strong className="text-zinc-900 font-bold">{evt.user}</strong> {evt.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
<<<<<<< HEAD
                      <span className="font-sans text-[9px] text-neutral-400 font-medium">
=======
                      <span className="font-mono text-[9px] text-zinc-400">
>>>>>>> origin/main
                        {evt.time}
                      </span>
                      <span className={`text-[8px] font-sans uppercase tracking-widest px-1.5 py-0.5 rounded font-bold ${evt.color}`}>
                        {evt.badge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h4 className="font-serif text-lg text-zinc-900 font-medium mb-4">
              Top Sản Phẩm Bán Chạy
            </h4>
            <div className="space-y-4">
              {topProducts.length > 0 ? topProducts.map((prod, idx) => (
                <div key={idx} className="flex gap-3 text-left items-center">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                    <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-800 font-bold truncate">{prod.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Đã bán: <span className="text-[#8c7623] font-bold">{prod.qty}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-zinc-900">{formatVND(prod.rev)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-zinc-400 text-xs py-4 italic">Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
