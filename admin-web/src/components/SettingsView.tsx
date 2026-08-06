/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Globe,
  ShieldCheck,
  Store,
  BellRing,
  Save,
  Palette
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const [storeName, setStoreName] = useState("Trendify Luxury Boutique");
  const [currency, setCurrency] = useState("VND");

  return (
    <div className="space-y-8 animate-fade-in text-left font-sans max-w-4xl mx-auto pb-12">

      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-[#cfc4c5]/40 custom-shadow">
        <div>
          <h3 className="text-xl text-neutral-900 font-bold">Cấu hình hệ thống</h3>
          <p className="text-xs text-neutral-400 mt-1 font-medium">
            Quản lý thông tin cửa hàng, tùy chọn hiển thị và thiết lập bảo mật cấp cao.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#6c5e06] text-white px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:bg-[#1b1c1c] shadow-md">
          <Save className="h-4 w-4" />
          Lưu tất cả thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Sidebar Nav for Settings */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-[#6c5e06]/10 text-[#6c5e06] rounded-xl border border-[#6c5e06]/20 transition-all text-left">
            <Store className="h-4 w-4" />
            <span className="text-[13px] font-bold">Thông tin cửa hàng</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-neutral-500 hover:bg-neutral-50 rounded-xl transition-all text-left font-semibold">
            <Palette className="h-4 w-4" />
            <span className="text-[13px]">Giao diện & Hiển thị</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-neutral-500 hover:bg-neutral-50 rounded-xl transition-all text-left font-semibold">
            <BellRing className="h-4 w-4" />
            <span className="text-[13px]">Thông báo hệ thống</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-neutral-500 hover:bg-neutral-50 rounded-xl transition-all text-left font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[13px]">Bảo mật & Quyền hạn</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">

          {/* General Section */}
          <div className="bg-white p-8 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-6">
            <h4 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-4">Thông tin cơ bản</h4>

            <div className="space-y-4 font-sans">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tên thương hiệu hiển thị</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-sm font-medium focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Đơn vị tiền tệ</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-sm font-medium focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800"
                  >
                    <option value="VND">Việt Nam Đồng (₫)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ngôn ngữ chính</label>
                  <select className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-sm font-medium focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800">
                    <option>Tiếng Việt</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Section */}
          <div className="bg-white p-8 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-6">
            <h4 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-4">Chế độ vận hành</h4>

            <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <div>
                <p className="text-sm font-bold text-emerald-800 font-sans">Chế độ Luxury Boutique</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5 font-sans">Tối ưu hóa hình ảnh độ phân giải cao và font chữ Playfair Display.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-xl">
              <div>
                <p className="text-sm font-bold text-neutral-800 font-sans">Bảo trì hệ thống</p>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5 font-sans">Tạm dừng mọi giao dịch khách hàng để nâng cấp cơ sở dữ liệu.</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200">
                <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
