/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
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

  const totalRevenue = orders
    .filter(o => o.status !== "Đã hủy")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === "Đang xử lý");
  const shippingOrders = orders.filter(o => o.status === "Đang vận chuyển");

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
      value: `${orders.length} Đơn hàng`,
      change: `+6.8%`,
      isPositive: true,
      subtext: `${pendingOrders.length} Đơn đang chờ xử lý`,
      icon: ShoppingBag,
      color: "bg-[#6c5e06]/10 text-[#6c5e06] border-[#6c5e06]/20"
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
  const recentEvents = [
    {
      user: "Nguyễn Minh Tú",
      action: "đã lưu một thiết kế đầm Silk vào giỏ hàng",
      time: "10 phút trước",
      badge: "Giỏ hàng",
      color: "text-amber-600 bg-amber-50"
    },
    {
      user: "Marie Laurent",
      action: "đã duyệt chỉnh sửa sản phẩm 'Silk Drape Blouse'",
      time: "42 phút trước",
      badge: "Hệ thống",
      color: "text-neutral-600 bg-neutral-100"
    },
    {
      user: "Lê Minh Anh",
      action: "yêu cầu chuyển đổi địa chỉ nhận hàng Đơn #TR-88210",
      time: "2 giờ trước",
      badge: "Ưu tiên",
      color: "text-rose-600 bg-rose-50"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Greetings Banner */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-[#cfc4c5]/40 custom-shadow">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#6c5e06]" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#6c5e06] uppercase font-bold">
              Bảng quản trị tối cao
            </span>
          </div>
          <h2 className="font-serif text-3.5xl tracking-normal text-[#1b1c1c] uppercase mt-2.5 font-light">
            Cảm hứng Sáng tạo <span className="font-normal italic text-[#6c5e06]">Trendify v1.0</span>
          </h2>
          <p className="font-sans text-xs text-neutral-500 mt-2.5 max-w-2xl leading-relaxed">
            Nơi kết tinh dịch vụ may đo thời trang Haute Couture cùng hệ thống quản lý dữ liệu bán hàng trực quan. 
            Mọi sửa đổi tồn kho hay cập nhật trạng thái hóa đơn sẽ ngay lập tức có hiệu lực trên toàn chuỗi boutique.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigateToTab("products")}
            className="font-sans text-[11px] font-bold tracking-widest text-[#1b1c1c] uppercase border border-neutral-300 px-5 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200"
          >
            Quản lý kho
          </button>
          <button 
            onClick={() => onNavigateToTab("orders")}
            className="font-sans text-[11px] font-bold tracking-widest text-white uppercase bg-[#1b1c1c] px-5 py-3 rounded-lg hover:bg-[#6c5e06] transition-all duration-200"
          >
            Danh sách đơn hàng
          </button>
        </div>
      </section>

      {/* Numerical Insights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-sans text-[11px] font-medium text-neutral-400 tracking-wider uppercase">
                    {stat.title}
                  </p>
                  <p className="font-serif text-2xl font-semibold text-neutral-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                  stat.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {stat.change}
                </span>
                <span className="font-sans text-[10px] text-neutral-400">
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
              <h3 className="font-serif text-2xl tracking-tight text-[#1b1c1c] leading-snug font-medium">
                “Sự cân bằng của sự hoàn hảo nằm ở tâm huyết trong từng đường may sợi chỉ.”
              </h3>
              <p className="font-sans text-[11px] text-neutral-500 leading-relaxed">
                Tại Trendify, chúng tôi định nghĩa trải nghiệm thượng lưu qua tính nguyên bản và độ tinh xảo của sản phẩm. 
                Từng chiếc áo Silk, từng đôi giày Terra Chelsea đều trải qua hàng trăm công đoạn thủ công trước khi xuất hiện trên sảnh trưng bày.
              </p>
              
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <p className="font-mono text-xs font-bold text-neutral-800">420 chiếc</p>
                  <p className="font-sans text-[10px] text-neutral-400">Sản xuất giới hạn</p>
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-neutral-800">100%</p>
                  <p className="font-sans text-[10px] text-neutral-400">Premium Silk & Leather</p>
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-neutral-800">Cơ sở</p>
                  <p className="font-sans text-[10px] text-neutral-400">Quận 1, TP. HCM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Flow (Pure Visual Metric Graph inside elegant block) */}
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-serif text-lg text-neutral-900 font-medium">
                  Hiệu suất dòng tiền giao dịch
                </h4>
                <p className="font-sans text-[10px] text-neutral-400">
                  Thống kê doanh số bán ra theo tuần của kỳ hiện hành (triệu VNĐ)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6c5e06]" />
                  <span className="text-[10px] font-sans text-neutral-500">Doanh số thực</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-200" />
                  <span className="text-[10px] font-sans text-neutral-500">Dự kiến bám rượt</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-44 w-full">
              <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                <line x1="30" y1="10" x2="580" y2="10" stroke="#f1eded" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="50" x2="580" y2="50" stroke="#f1eded" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="90" x2="580" y2="90" stroke="#f1eded" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="130" x2="580" y2="130" stroke="#f1eded" strokeWidth="1" />

                {/* Simulated Target Flow Area */}
                <path 
                  d="M 30,120 Q 120,90 210,105 T 390,40 T 580,15 L 580,130 L 30,130 Z" 
                  fill="url(#goldGradient)" 
                  opacity="0.06" 
                />

                {/* Target Guide line */}
                <path 
                  d="M 30,120 Q 120,90 210,105 T 390,40 T 580,15" 
                  fill="none" 
                  stroke="#6c5e06" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                {/* Data points */}
                <circle cx="30" cy="120" r="4.5" fill="#ffffff" stroke="#6c5e06" strokeWidth="2.5" />
                <circle cx="120" cy="95" r="4.5" fill="#ffffff" stroke="#6c5e06" strokeWidth="2.5" />
                <circle cx="210" cy="105" r="4.5" fill="#ffffff" stroke="#6c5e06" strokeWidth="2.5" />
                <circle cx="300" cy="70" r="4.5" fill="#ffffff" stroke="#6c5e06" strokeWidth="2.5" />
                <circle cx="390" cy="40" r="4.5" fill="#ffffff" stroke="#6c5e06" strokeWidth="2.5" />
                <circle cx="480" cy="30" r="4.5" fill="#ffffff" stroke="#1b1c1c" strokeWidth="2.5" />
                <circle cx="580" cy="15" r="4.5" fill="#ffffff" stroke="#6c5e06" strokeWidth="2.5" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c5e06" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Labels */}
                <text x="30" y="148" textAnchor="middle" className="font-mono text-[9px] fill-neutral-400">T2</text>
                <text x="120" y="148" textAnchor="middle" className="font-mono text-[9px] fill-neutral-400">T3</text>
                <text x="210" y="148" textAnchor="middle" className="font-mono text-[9px] fill-neutral-400">T4</text>
                <text x="300" y="148" textAnchor="middle" className="font-mono text-[9px] fill-neutral-400">T5</text>
                <text x="390" y="148" textAnchor="middle" className="font-mono text-[9px] fill-neutral-400">T6</text>
                <text x="480" y="148" textAnchor="middle" className="font-mono text-[9px] fill-neutral-400">T7</text>
                <text x="580" y="148" textAnchor="middle" className="font-mono text-[9px] fill-neutral-400">CN</text>

                <text x="15" y="12" textAnchor="middle" className="font-mono text-[8px] fill-neutral-300">20M</text>
                <text x="15" y="52" textAnchor="middle" className="font-mono text-[8px] fill-neutral-300">10M</text>
                <text x="15" y="92" textAnchor="middle" className="font-mono text-[8px] fill-neutral-300">5M</text>
                <text x="15" y="133" textAnchor="middle" className="font-mono text-[8px] fill-neutral-300">0</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Live Client Order Action feed (Right Panel) */}
        <div className="space-y-6">
          {/* Active Orders List */}
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow flex flex-col justify-between h-[360px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif text-lg text-neutral-900 font-medium">
                  Đơn hàng live
                </h4>
                <button 
                  onClick={() => onNavigateToTab("orders")}
                  className="text-xs text-[#6c5e06] hover:underline flex items-center gap-1 font-sans font-semibold uppercase tracking-wider text-[10px]"
                >
                  Tất cả <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {orders.slice(0, 4).map((order) => {
                  return (
                    <div 
                      key={order.id}
                      onClick={() => {
                        onSelectOrder(order);
                        onNavigateToTab("orders");
                      }}
                      className="p-3 border border-neutral-100 rounded-lg hover:border-[#6c5e06]/45 hover:bg-neutral-50/50 cursor-pointer transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-100 ring-1 ring-neutral-200">
                          <img 
                            src={order.customerAvatar} 
                            alt={order.customerName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-800 font-sans">
                            {order.customerName}
                          </p>
                          <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                            ID: {order.id} • {order.items.length} món
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-neutral-900 font-mono">
                          {formatVND(order.total)}
                        </p>
                        <span className={`text-[9px] font-sans px-2 py-0.5 rounded-full inline-block mt-1 font-semibold ${
                          order.status === "Đang xử lý" 
                            ? "bg-amber-50 text-amber-700" 
                            : order.status === "Đang vận chuyển" 
                            ? "bg-sky-50 text-sky-700" 
                            : order.status === "Đã hủy"
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
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
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow">
            <h4 className="font-serif text-lg text-neutral-900 font-medium mb-4">
              Nhật ký hệ thống live
            </h4>
            <div className="space-y-4">
              {recentEvents.map((evt, idx) => (
                <div key={idx} className="flex gap-3 text-left">
                  <div className="mt-1.5">
                    <span className="w-1.5 h-1.5 block rounded-full bg-[#6c5e06] animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-700 leading-relaxed font-sans font-medium">
                      <strong className="text-neutral-900 font-bold">{evt.user}</strong> {evt.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[9px] text-neutral-400">
                        {evt.time}
                      </span>
                      <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${evt.color}`}>
                        {evt.badge}
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
