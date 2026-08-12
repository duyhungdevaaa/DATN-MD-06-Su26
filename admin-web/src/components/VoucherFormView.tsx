/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Ticket } from "lucide-react";
import { Voucher } from "../types";

interface VoucherFormViewProps {
  editingVoucher?: Voucher | null;
  onSaveVoucher: (voucher: Partial<Voucher>) => void;
  onCancel: () => void;
}

export const VoucherFormView: React.FC<VoucherFormViewProps> = ({
  editingVoucher,
  onSaveVoucher,
  onCancel
}) => {
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [maximumDiscount, setMaximumDiscount] = useState<number>(0);
  const [expirationDate, setExpirationDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Helper to convert DD/MM/YYYY to YYYY-MM-DD for <input type="date">
  const convertToInputDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  // Helper to convert YYYY-MM-DD to DD/MM/YYYY
  const convertToDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d}/${m}/${y}`;
      }
    }
    return dateStr;
  };

  useEffect(() => {
    if (editingVoucher) {
      setCode(editingVoucher.code);
      setDiscountAmount(editingVoucher.discountAmount);
      setDiscountRate(editingVoucher.discountRate);
      setMaximumDiscount(editingVoucher.maximumDiscount);
      setExpirationDate(convertToInputDate(editingVoucher.expirationDate));
    }
  }, [editingVoucher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setErrorMsg("Vui lòng nhập mã Voucher!");
      return;
    }
    
    if (discountAmount <= 0 && discountRate <= 0) {
      setErrorMsg("Vui lòng thiết lập mức giảm giá (Số tiền hoặc Phần trăm)!");
      return;
    }
    
    if (!expirationDate) {
      setErrorMsg("Vui lòng chọn ngày hết hạn!");
      return;
    }

    const formattedDate = convertToDisplayDate(expirationDate);

    setErrorMsg("");
    
    onSaveVoucher({
      id: editingVoucher?.id, // Passing ID ensures existing voucher document is overwritten/updated
      code: code.trim().toUpperCase(),
      discountAmount,
      discountRate,
      maximumDiscount,
      expirationDate: formattedDate
    });
  };

  return (
    <div className="animate-fade-in font-sans pb-12 text-left">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-semibold">Quay lại</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-mono">
            {editingVoucher ? `Chỉnh sửa mã: ${editingVoucher.code}` : "Tạo mã giảm giá mới"}
          </span>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-800 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Save className="h-4 w-4" />
            {editingVoucher ? "Cập nhật mã" : "Lưu mã giảm giá"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Basic Info Form */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Ticket className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-zinc-900">
              {editingVoucher ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Mã giảm giá <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:bg-white focus:border-zinc-900 focus:outline-none transition-all uppercase"
                placeholder="VD: MAGIAM20K"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Giảm theo phần trăm (%)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">%</span>
                  <input
                    type="number"
                    value={discountRate || ""}
                    onChange={e => setDiscountRate(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
                    placeholder="VD: 15"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Giảm theo số tiền (VNĐ)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">₫</span>
                  <input
                    type="number"
                    value={discountAmount || ""}
                    onChange={e => setDiscountAmount(Number(e.target.value))}
                    min="0"
                    step="1000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
                    placeholder="VD: 50000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Mức giảm tối đa (VNĐ)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">₫</span>
                  <input
                    type="number"
                    value={maximumDiscount || ""}
                    onChange={e => setMaximumDiscount(Number(e.target.value))}
                    min="0"
                    step="1000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
                    placeholder="VD: 100000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Ngày hết hạn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={e => setExpirationDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-sm font-sans font-medium focus:bg-white focus:border-zinc-900 focus:outline-none transition-all text-zinc-800"
                  required
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

