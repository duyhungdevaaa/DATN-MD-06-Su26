/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Ticket, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Percent, 
  CircleDollarSign, 
  Copy, 
  Check, 
  LayoutList, 
  LayoutGrid,
  Calendar
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"LIST" | "GRID">("LIST");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
  };

  const isExpired = (expirationDate: string) => {
    if (!expirationDate) return false;
    
    // Parse DD/MM/YYYY or YYYY-MM-DD
    if (expirationDate.includes("/")) {
      const parts = expirationDate.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const expDate = new Date(year, month, day, 23, 59, 59);
        return expDate < new Date();
      }
    } else if (expirationDate.includes("-")) {
      const parts = expirationDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const expDate = new Date(year, month, day, 23, 59, 59);
        return expDate < new Date();
      }
    }
    const d = new Date(expirationDate);
    return !isNaN(d.getTime()) && d < new Date();
  };

  const activeVouchersCount = vouchers.filter(v => !isExpired(v.expirationDate)).length;
  const expiredVouchersCount = vouchers.filter(v => isExpired(v.expirationDate)).length;

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchText.toLowerCase());
    const expired = isExpired(voucher.expirationDate);
    
    let matchesFilter = true;
    if (filterStatus === "ACTIVE") matchesFilter = !expired;
    if (filterStatus === "EXPIRED") matchesFilter = expired;

    return matchesSearch && matchesFilter;
  });

  const handleDeleteCheck = (id: string, code: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa voucher "${code}" khỏi hệ thống?`);
    if (isConfirmed) {
      onDeleteVoucher(id);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans pb-12">
      
      {/* 1. Header & Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase">Tổng mã giảm giá</p>
            <p className="text-2xl font-black text-zinc-900 mt-1">{vouchers.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-100 text-zinc-700">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase">Đang áp dụng (Còn hạn)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeVouchersCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase">Đã hết hạn</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{expiredVouchersCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Control & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        
        {/* Status Filter & View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                filterStatus === "ALL" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Tất cả ({vouchers.length})
            </button>
            <button
              onClick={() => setFilterStatus("ACTIVE")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                filterStatus === "ACTIVE" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Còn hạn ({activeVouchersCount})
            </button>
            <button
              onClick={() => setFilterStatus("EXPIRED")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                filterStatus === "EXPIRED" ? "bg-white text-rose-700 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Hết hạn ({expiredVouchersCount})
            </button>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 text-xs font-semibold">
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "LIST" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"}`}
              title="Dạng danh sách (Bảng)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "GRID" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"}`}
              title="Dạng lưới thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onAddVoucherClick}
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Tạo Mã Giảm Giá
        </button>
      </div>

      {/* 3. Vouchers Data Display */}
      {filteredVouchers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-16 text-center shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-3">
            <Ticket className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-base font-bold text-zinc-800">Không tìm thấy mã giảm giá nào</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Hệ thống chưa có mã voucher nào hoặc không khớp với điều kiện tìm kiếm/bộ lọc.
          </p>
        </div>
      ) : viewMode === "LIST" ? (
        /* ======================================================== */
        /* LIST / TABLE VIEW (MẶC ĐỊNH DẠNG LIST THEO YÊU CẦU)     */
        /* ======================================================== */
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 min-w-[180px]">Mã giảm giá</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Mức ưu đãi</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Giảm tối đa</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Hạn sử dụng</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredVouchers.map((voucher) => {
                  const expired = isExpired(voucher.expirationDate);
                  const isPercent = (voucher.discountRate || 0) > 0;
                  const isCopied = copiedCode === voucher.code;

                  return (
                    <tr key={voucher.id} className="hover:bg-zinc-50/80 transition-colors group">
                      
                      {/* Code */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border shrink-0 ${
                            expired 
                              ? "bg-zinc-100 border-zinc-200 text-zinc-400" 
                              : "bg-emerald-50 border-emerald-200 text-emerald-600"
                          }`}>
                            <Ticket className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-sm tracking-wider uppercase text-zinc-900">
                                {voucher.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(voucher.code)}
                                className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
                                title="Sao chép mã"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">ID: #{voucher.id.substring(0, 6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {isPercent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60 font-black text-xs">
                              <Percent className="w-3 h-3" />
                              Giảm {voucher.discountRate}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-black text-xs">
                              <CircleDollarSign className="w-3 h-3" />
                              Giảm {formatPrice(voucher.discountAmount)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Maximum Discount */}
                      <td className="py-4 px-4 font-semibold text-zinc-700">
                        {voucher.maximumDiscount && voucher.maximumDiscount > 0 ? (
                          <span>Tối đa {formatPrice(voucher.maximumDiscount)}</span>
                        ) : (
                          <span className="text-zinc-400 italic">Không giới hạn</span>
                        )}
                      </td>

                      {/* Expiration Date */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{voucher.expirationDate || "Không thời hạn"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          expired 
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${expired ? "bg-rose-500" : "bg-emerald-500"}`} />
                          {expired ? "Đã hết hạn" : "Đang áp dụng"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditVoucherClick(voucher)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                            title="Chỉnh sửa mã"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCheck(voucher.id, voucher.code)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Xóa mã"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* GRID CARDS VIEW                                          */
        /* ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVouchers.map((voucher) => {
            const expired = isExpired(voucher.expirationDate);
            const isPercent = (voucher.discountRate || 0) > 0;
            const isCopied = copiedCode === voucher.code;

            return (
              <div 
                key={voucher.id}
                className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col hover:border-zinc-300 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className={`p-4 flex items-center justify-between border-b ${expired ? 'bg-zinc-50 border-zinc-100' : 'bg-emerald-50/40 border-emerald-100/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${expired ? 'bg-zinc-200/70 border-zinc-300 text-zinc-500' : 'bg-emerald-100 border-emerald-200 text-emerald-600'}`}>
                      <Ticket className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm text-zinc-900 font-bold uppercase tracking-wider">
                        {voucher.code}
                      </h4>
                      <p className={`text-[10px] font-bold ${expired ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {expired ? "Đã hết hạn" : "Đang hoạt động"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 bg-white rounded-lg border border-zinc-200 shadow-2xs text-[11px] font-semibold flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Đã chép" : "Copy"}
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium">Mức giảm:</span>
                      {isPercent ? (
                        <span className="font-extrabold text-purple-700 text-sm">Giảm {voucher.discountRate}%</span>
                      ) : (
                        <span className="font-extrabold text-blue-700 text-sm">Giảm {formatPrice(voucher.discountAmount)}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium">Giảm tối đa:</span>
                      <span className="font-semibold text-zinc-800">
                        {voucher.maximumDiscount > 0 ? formatPrice(voucher.maximumDiscount) : "Không giới hạn"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className="text-zinc-500 font-medium">Hạn sử dụng:</span>
                      <span className="font-semibold text-zinc-800">{voucher.expirationDate || "Không giới hạn"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                    <button
                      onClick={() => onEditVoucherClick(voucher)}
                      className="px-3 py-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCheck(voucher.id, voucher.code)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
