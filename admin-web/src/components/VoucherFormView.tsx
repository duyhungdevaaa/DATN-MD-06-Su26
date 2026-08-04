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

  useEffect(() => {
    if (editingVoucher) {
      setCode(editingVoucher.code);
      setDiscountAmount(editingVoucher.discountAmount);
      setDiscountRate(editingVoucher.discountRate);
      setMaximumDiscount(editingVoucher.maximumDiscount);
      setExpirationDate(editingVoucher.expirationDate);
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
      setErrorMsg("Vui lòng nhập ngày hết hạn (DD/MM/YYYY)!");
      return;
    }

    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(expirationDate)) {
      setErrorMsg("Ngày hết hạn phải đúng định dạng DD/MM/YYYY!");
      return;
    }

    setErrorMsg("");
    
    onSaveVoucher({
      code: code.trim().toUpperCase(),
      discountAmount,
      discountRate,
      maximumDiscount,
      expirationDate: expirationDate.trim()
    });
  };

  return (
    <div className="animate-fade-in font-sans pb-12 text-left">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Quay lại</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-400 font-mono">
            {editingVoucher ? `Chỉnh sửa: ${editingVoucher.code}` : "Tạo mới voucher"}
          </span>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-[#8c7623] text-white hover:bg-[#7a661c] px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-[#8c7623]/20"
          >
            <Save className="h-4 w-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Basic Info Form */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200/50 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <Ticket className="h-4.5 w-4.5 text-[#8c7623]" />
            <h4 className="font-serif text-base text-zinc-950 font-bold">
              Thông Tin Voucher
            </h4>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-900 font-sans">
                Mã Voucher <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono font-bold focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none transition-all uppercase"
                placeholder="VD: TRENDIFYSUMMER"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-900 font-sans">
                  Giảm theo %
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">%</span>
                  <input
                    type="number"
                    value={discountRate}
                    onChange={e => setDiscountRate(Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-3 text-sm font-sans focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none transition-all"
                    placeholder="VD: 15"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-900 font-sans">
                  Giảm theo số tiền (VND)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">₫</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(Number(e.target.value))}
                    min="0"
                    step="1000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-4 py-3 text-sm font-sans focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none transition-all"
                    placeholder="VD: 50000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-900 font-sans">
                  Mức giảm tối đa (VND)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">₫</span>
                  <input
                    type="number"
                    value={maximumDiscount}
                    onChange={e => setMaximumDiscount(Number(e.target.value))}
                    min="0"
                    step="1000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-4 py-3 text-sm font-sans focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none transition-all"
                    placeholder="VD: 100000"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-sans">Áp dụng khi dùng "Giảm theo %"</p>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-900 font-sans">
                  Ngày hết hạn (DD/MM/YYYY) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={expirationDate}
                  onChange={e => setExpirationDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none transition-all"
                  placeholder="VD: 31/12/2026"
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
