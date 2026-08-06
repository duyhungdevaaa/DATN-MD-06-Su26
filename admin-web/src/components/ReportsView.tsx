/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Calendar,
  FileText
} from "lucide-react";

export const ReportsView: React.FC = () => {
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left font-sans">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#cfc4c5]/40 custom-shadow">
        <div>
          <h3 className="text-lg text-neutral-900 font-bold">Thống kê & Báo cáo chuyên sâu</h3>
          <p className="text-xs text-neutral-400 mt-1 font-medium">
            Phân tích hiệu suất kinh doanh, lưu lượng truy cập và chỉ số tài chính định kỳ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#fbf9f9] text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:bg-neutral-50">
            <Calendar className="h-4 w-4" />
            Tháng này
          </button>
          <button className="flex items-center gap-2 bg-[#1b1c1c] text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:bg-[#6c5e06] shadow-md">
            <Download className="h-4 w-4" />
            Xuất báo cáo PDF
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Summary Card */}
        <div className="bg-white p-8 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Doanh thu thuần</p>
              <h4 className="text-2xl font-bold text-neutral-900">{formatVND(125000000)}</h4>
            </div>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Tăng <span className="text-emerald-600 font-bold">+12%</span> so với tháng trước.
          </p>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-8 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Đơn hàng hoàn tất</p>
              <h4 className="text-2xl font-bold text-neutral-900">1,248</h4>
            </div>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Tỷ lệ chuyển đổi đạt <span className="text-blue-600 font-bold">4.2%</span>.
          </p>
        </div>

        {/* Customer Growth Card */}
        <div className="bg-white p-8 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <PieChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Khách hàng mới</p>
              <h4 className="text-2xl font-bold text-neutral-900">+342</h4>
            </div>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Phần lớn đến từ <span className="text-amber-600 font-bold">Hà Nội & TP. HCM</span>.
          </p>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-xl border border-[#cfc4c5]/30 custom-shadow overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h4 className="text-base font-bold text-neutral-900">Chi tiết doanh số theo hạng mục</h4>
          <FileText className="h-5 w-5 text-neutral-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbf9f9] border-b border-neutral-100 text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Hạng mục</th>
                <th className="px-6 py-4">Số lượng bán</th>
                <th className="px-6 py-4">Doanh thu</th>
                <th className="px-6 py-4">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {[
                { cat: "Đầm tối muộn", qty: 156, rev: 45000000, grow: "+8.4%" },
                { cat: "Trang sức lụa", qty: 89, rev: 28000000, grow: "+15.2%" },
                { cat: "Chelsea Boots", qty: 42, rev: 32000000, grow: "-2.1%" },
                { cat: "Phụ kiện da", qty: 210, rev: 12000000, grow: "+22.5%" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-800">{row.cat}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-600">{row.qty}</td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-900">{formatVND(row.rev)}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${row.grow.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.grow}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
