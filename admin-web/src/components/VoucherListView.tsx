/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Search, Trash2, Edit3, Ticket, AlertCircle } from "lucide-react";
import { Voucher } from "../types";

interface VoucherListViewProps {
  vouchers: Voucher[];
  searchText: string;
  onAddVoucherClick: () => void;
  onEditVoucherClick: (voucher: Voucher) => void;
  onDeleteVoucher: (voucherId: string) => void;
}

export const VoucherListView: React.FC<VoucherListViewProps> = ({
  vouchers,
  searchText,
  onAddVoucherClick,
  onEditVoucherClick,
  onDeleteVoucher
}) => {
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "EXPIRED">("ALL");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const isExpired = (expirationDate: string) => {
    if (!expirationDate) return false;
    
    // Parse DD/MM/YYYY
    const parts = expirationDate.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    const expDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return expDate < today;
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = 
      voucher.code.toLowerCase().includes(searchText.toLowerCase());
      
    const expired = isExpired(voucher.expirationDate);
    
    let matchesFilter = true;
    if (filterStatus === "ACTIVE") matchesFilter = !expired;
    if (filterStatus === "EXPIRED") matchesFilter = expired;

    return matchesSearch && matchesFilter;
  });

  const handleDeleteCheck = (id: string, code: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa voucher "${code}" khỏi cơ sở dữ liệu?`);
    if (isConfirmed) {
      onDeleteVoucher(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/40">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`text-[10px] uppercase font-bold tracking-wider px-4.5 py-1.5 rounded-lg transition-all duration-200 ${
                filterStatus === "ALL" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("ACTIVE")}
              className={`text-[10px] uppercase font-bold tracking-wider px-4.5 py-1.5 rounded-lg transition-all duration-200 ${
                filterStatus === "ACTIVE" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Còn hạn
            </button>
            <button
              onClick={() => setFilterStatus("EXPIRED")}
              className={`text-[10px] uppercase font-bold tracking-wider px-4.5 py-1.5 rounded-lg transition-all duration-200 ${
                filterStatus === "EXPIRED" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Hết hạn
            </button>
          </div>
        </div>

        {/* Master Addition Button */}
        <button
          onClick={onAddVoucherClick}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white hover:bg-[#8c7623] px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase font-sans transition-all duration-200 shadow-md shadow-zinc-900/5 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Thêm Voucher
        </button>
      </div>

      {/* Voucher List Display */}
      {filteredVouchers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-16 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4">
            <Ticket className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="font-serif text-lg text-zinc-800 font-medium">Không có mã giảm giá nào</h3>
          <p className="font-sans text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Hệ thống chưa có voucher hoặc không khớp với điều kiện lọc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const expired = isExpired(voucher.expirationDate);
            
            return (
              <div 
                key={voucher.id}
                className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden flex flex-col group hover:border-[#8c7623]/40 hover:shadow-md transition-all duration-350"
              >
                {/* Header Pattern */}
                <div className={`p-5 flex items-center justify-between border-b ${expired ? 'bg-zinc-100 border-zinc-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${expired ? 'bg-zinc-200 text-zinc-500' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-base text-zinc-900 font-bold tracking-wider uppercase">
                        {voucher.code}
                      </h4>
                      <p className={`font-sans text-[10px] uppercase font-bold tracking-wider mt-0.5 ${expired ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {expired ? "Đã hết hạn" : "Đang hoạt động"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Mức giảm</span>
                      <strong className="font-sans text-sm text-zinc-900 font-bold">
                        {voucher.discountRate > 0 ? `${voucher.discountRate}%` : formatPrice(voucher.discountAmount)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Giảm tối đa</span>
                      <strong className="font-mono text-xs text-zinc-950">
                        {formatPrice(voucher.maximumDiscount)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Hạn sử dụng</span>
                      <span className="font-mono text-xs text-zinc-950 flex items-center gap-1.5">
                        {expired && <AlertCircle className="h-3 w-3 text-rose-500" />}
                        {voucher.expirationDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                    <button
                      onClick={() => onEditVoucherClick(voucher)}
                      className="p-1.5 px-3 bg-zinc-50 hover:bg-[#8c7623]/10 text-zinc-650 hover:text-[#8c7623] text-[10px] uppercase font-bold tracking-wider font-sans rounded-lg border border-zinc-200/80 transition-colors duration-200 flex items-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCheck(voucher.id, voucher.code)}
                      className="p-1.5 px-3 bg-zinc-50 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 text-[10px] uppercase font-bold tracking-wider font-sans rounded-lg border border-zinc-200/80 transition-colors duration-200 flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
