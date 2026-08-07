/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Printer, 
  MapPin,
  UserCheck, 
  CreditCard,
  Truck,
  CircleCheck,
  Sparkles,
  OctagonAlert,
  Phone
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderDetailViewProps {
  order: Order;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onCancel: () => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onUpdateOrderStatus,
  onCancel
}) => {
  const [showInvoicePrintAlert, setShowInvoicePrintAlert] = useState(false);

  if (!order) {
    return (
      <div className="p-10 text-center bg-white rounded-xl shadow-sm border border-neutral-100">
        <h3 className="text-sm font-bold text-neutral-800">Không tìm thấy dữ liệu đơn hàng</h3>
        <button onClick={onCancel} className="mt-2 text-[#6c5e06] font-bold text-xs uppercase">Quay lại</button>
      </div>
    );
  }

  const formatVND = (num: any) => {
    const val = typeof num === 'number' ? num : parseFloat(num) || 0;
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const getBadgeColor = (status: any) => {
    switch (status) {
      case OrderStatus.PENDING: return "bg-amber-50 text-amber-600 border-amber-100";
      case OrderStatus.SHIPPING: return "bg-orange-50 text-orange-600 border-orange-100";
      case OrderStatus.DELIVERED: return "bg-green-50 text-green-600 border-green-100";
      default: return "bg-red-50 text-red-600 border-red-100";
    }
  };

  const handlePrintMock = () => {
    setShowInvoicePrintAlert(true);
    setTimeout(() => {
      setShowInvoicePrintAlert(false);
      window.print();
    }, 1500);
  };

  return (
    <div className="space-y-2 max-w-5xl mx-auto animate-fade-in text-left pb-4 font-sans text-xs">
      
      {/* Top Navigation - Ultra Compact */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-2 rounded-lg border border-white shadow-sm sticky top-0 z-20">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-neutral-500 hover:text-[#111827] font-bold transition-all group">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Trở về</span>
        </button>

        <button onClick={handlePrintMock} className="h-7 px-3 rounded-md bg-white border border-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center gap-1.5 hover:bg-neutral-50 active:scale-95 transition-all">
          <Printer className="h-3 w-3" /> In hóa đơn
        </button>
      </div>

      {showInvoicePrintAlert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
          <div className="bg-white p-4 rounded-xl shadow-2xl text-center space-y-2 max-w-[240px] border border-neutral-100">
            <Printer className="h-5 w-5 text-green-600 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-neutral-900">Khởi động máy in...</h4>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        
        {/* Main Content (Items & Totals) */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <div>
                <p className="text-[8px] font-black text-[#6c5e06] uppercase tracking-wider">Mã đơn hàng</p>
                <h3 className="text-base font-black text-neutral-900">#{order.id || '---'}</h3>
                <p className="text-[10px] text-neutral-500 font-medium">{order.date || ''} • {order.time || ''}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeColor(order.status)}`}>
                {order.status || 'Unknown'}
              </span>
            </div>

            <div className="p-3">
              <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Sản phẩm</h4>
              <div className="space-y-2">
                {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
                      <img src={item?.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-neutral-900 text-[12px] truncate">{item?.name || "Sản phẩm"}</h5>
                      <div className="flex gap-2 text-[10px] text-neutral-400 font-medium">
                        <span>S: {item?.size || 'M'}</span>
                        <span>M: {item?.color || 'N/A'}</span>
                        <span className="text-[#6c5e06] font-bold">x{item?.quantity || 1}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 text-[12px]">{formatVND(item?.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-neutral-50/50 border-t border-neutral-100 space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
                <span>Tạm tính</span>
                <span className="text-neutral-900 font-bold">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
                <span>Phí ship</span>
                <span className="text-neutral-900 font-bold">{formatVND(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-neutral-200 mt-1">
                <span className="font-bold text-neutral-900 uppercase text-[10px]">Tổng cộng</span>
                <span className="text-lg font-black text-[#6c5e06]">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Update Controls - Ultra Compact Row */}
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-neutral-900 text-xs mb-2">Cập nhật trạng thái</h4>
            <div className="flex flex-wrap gap-2">
              {Object.values(OrderStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateOrderStatus(order.id, s)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                    order.status === s ? "bg-[#6c5e06] text-white border-transparent shadow-sm" : "bg-white text-neutral-400 border-neutral-100 hover:border-neutral-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info - More Compact */}
        <div className="space-y-2.5">
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-50 pb-2">
              <UserCheck className="h-3.5 w-3.5 text-[#6c5e06]" />
              <h4 className="font-bold text-neutral-900 text-xs">Khách hàng</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-100 ring-1 ring-neutral-50">
                <img src={order.customerAvatar || ""} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-neutral-900 text-[11px] truncate">{order.customerName || "Khách hàng"}</p>
                <p className="text-[9px] text-neutral-400 font-medium truncate">{order.email || "No email"}</p>
              </div>
            </div>
            <div className="space-y-2 pt-0.5">
              <div className="flex gap-2 items-start">
                <MapPin className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                <p className="text-neutral-600 font-medium leading-snug">{order.address || "No address"}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Phone className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                <p className="text-neutral-600 font-bold">{order.phone || "No phone"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-[#6c5e06]" />
              <h4 className="font-bold text-neutral-900 text-xs">Thanh toán</h4>
            </div>
            <span className="font-bold text-neutral-900 uppercase text-[10px]">{order.paymentMethod || "COD"}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-50 pb-2">
              <Truck className="h-3.5 w-3.5 text-[#6c5e06]" />
              <h4 className="font-bold text-neutral-900 text-xs">Hành trình</h4>
            </div>
            <div className="space-y-3">
               <div className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <CircleCheck className="h-3.5 w-3.5 text-[#6c5e06]" />
                    <div className="w-px h-4 bg-[#6c5e06]/10 mt-1"></div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-neutral-900">{order.status !== OrderStatus.CANCELLED ? "Tiếp nhận" : "Đã hủy"}</p>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase">{order.timeline?.confirmed?.time || order.date}</p>
                  </div>
               </div>
               <div className="flex gap-2.5">
                  <Truck className="h-3.5 w-3.5 text-neutral-200" />
                  <p className="text-[11px] font-bold text-neutral-300">Vận chuyển</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
