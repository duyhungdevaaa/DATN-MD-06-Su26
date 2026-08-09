/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ActiveTab } from "../types";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Tag, 
  FolderGit2, 
  LogOut,
  Ticket,
  Bell,
  Image as ImageIcon
} from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  productCount: number;
  orderCount: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  productCount,
  orderCount,
  onLogout
}) => {
  const menuItems = [
    {
      id: ActiveTab.DASHBOARD,
      label: "Tổng quan",
      icon: LayoutDashboard,
      badge: null,
      description: "Bảng điều khiển"
    },
    {
      id: ActiveTab.ORDERS,
      label: "Đơn hàng",
      icon: ShoppingBag,
      badge: orderCount > 0 ? orderCount.toString() : null,
      description: "Quản lý đơn hàng"
    },
    {
      id: ActiveTab.PRODUCTS,
      label: "Sản phẩm",
      icon: Tag,
      badge: productCount > 0 ? productCount.toString() : null,
      description: "Quản lý kho"
    },
    {
      id: ActiveTab.CATEGORIES,
      label: "Danh mục",
      icon: FolderGit2,
      badge: null,
      description: "Phân loại hàng"
    },
    {
      id: ActiveTab.VOUCHERS,
      label: "Voucher",
      icon: Ticket,
      badge: null,
      description: "Mã khuyến mãi"
    },
    {
      id: ActiveTab.USERS,
      label: "Khách hàng",
      icon: Users,
      badge: null,
      description: "Cơ sở dữ liệu"
    },
    {
      id: ActiveTab.NOTIFICATIONS,
      label: "Thông báo",
      icon: Bell,
      badge: null,
      description: "Gửi tin nhắn App"
    },
    {
      id: ActiveTab.BANNERS,
      label: "Banner QC",
      icon: ImageIcon,
      badge: null,
      description: "Ảnh quảng cáo"
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-100 h-screen sticky top-0 flex flex-col z-20 overflow-y-auto font-sans shrink-0">
      {/* Branding Header */}
      <div className="p-6 border-b border-zinc-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-sans text-xl font-bold">T</div>
          <div>
            <h1 className="font-sans text-xl tracking-tight text-zinc-950 font-bold leading-none">
              Trendify
            </h1>
            <p className="font-sans text-[8px] tracking-[0.2em] text-[#8c7623] uppercase mt-0.5 font-bold">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 px-3 py-6 space-y-0.5">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-200 relative ${
                isActive 
                  ? "bg-zinc-950 text-white shadow-lg shadow-black/5"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <IconComponent
                className={`h-4.5 w-4.5 mt-0.5 transition-colors ${
                  isActive ? "text-[#8c7623]" : "text-zinc-400 group-hover:text-zinc-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-semibold tracking-tight font-sans ${
                    isActive ? "text-white" : "text-zinc-800"
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`font-sans text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? "bg-[#8c7623] text-white" 
                        : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] font-normal font-sans mt-0.5 leading-none ${
                  isActive ? "text-zinc-400" : "text-zinc-400"
                }`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-zinc-50 bg-zinc-50/30">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2 bg-white hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-lg transition-all border border-zinc-200/60 hover:border-rose-100 shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider font-sans">Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};
