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
      <div className="p-20 text-center bg-white rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="text-xl font-bold text-neutral-800">Không tìm thấy dữ liệu đơn hàng</h3>
        <button onClick={onCancel} className="mt-4 px-6 py-2 bg-[#6c5e06] text-white rounded-lg font-bold shadow-md hover:bg-[#5a4e05] transition-all">
          Quay lại danh sách
        </button>
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
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in text-left pb-16 font-sans">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm sticky top-0 z-20 mb-4">
        <button onClick={onCancel} className="flex items-center gap-2 text-neutral-500 hover:text-[#111827] font-semibold transition-all group">
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Trở về danh sách
        </button>

        <button onClick={handlePrintMock} className="h-10 px-5 rounded-xl bg-white border border-neutral-200 text-neutral-800 text-sm font-bold flex items-center gap-2 hover:bg-neutral-50 shadow-sm active:scale-95 transition-all">
          <Printer className="h-4 w-4" /> In hóa đơn
        </button>
      </div>

      {showInvoicePrintAlert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center animate-fade-in">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm border border-neutral-100 scale-110">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto animate-pulse">
              <Printer className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900">Khởi động máy in...</h4>
            <p className="text-sm text-neutral-500">Vui lòng đợi trong giây lát.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Items & Totals) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-[#6c5e06] uppercase tracking-[0.2em] mb-1">Mã đơn hàng</p>
                <h3 className="text-3xl font-black text-neutral-900">#{order.id || '---'}</h3>
                <p className="text-sm text-neutral-500 mt-1 font-medium">{order.date || ''} • {order.time || ''}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getBadgeColor(order.status)}`}>
                {order.status || 'Unknown'}
              </span>
            </div>

            <div className="p-8">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">Sản phẩm trong đơn</h4>
              <div className="space-y-6">
                {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-6 items-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
                      <img src={item?.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-neutral-900 text-lg truncate">{item?.name || "Sản phẩm"}</h5>
                      <div className="flex gap-3 mt-1 text-sm text-neutral-500 font-medium">
                        <span>Size: {item?.size || 'M'}</span>
                        <span>Màu: {item?.color || 'N/A'}</span>
                        <span className="text-[#6c5e06] font-bold">x{item?.quantity || 1}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{formatVND(item?.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 space-y-3">
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Tạm tính</span>
                <span className="text-neutral-900 font-bold">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Phí ship</span>
                <span className="text-neutral-900 font-bold">{formatVND(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-neutral-200 mt-4">
                <span className="font-black text-neutral-900 uppercase tracking-tighter text-lg">Tổng cộng</span>
                <span className="text-3xl font-black text-[#6c5e06]">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Update Controls */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="font-bold text-neutral-900 text-lg mb-2">Trạng thái đơn hàng</h4>
            <p className="text-sm text-neutral-500 mb-6 font-medium">Cập nhật tiến độ xử lý đơn hàng này.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(OrderStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateOrderStatus(order.id, s)}
                  className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                    order.status === s ? "bg-[#6c5e06] text-white border-transparent shadow-lg shadow-[#6c5e06]/20" : "bg-white text-neutral-400 border-neutral-100 hover:border-neutral-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info (Customer & Shipping) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-50 pb-4">
              <UserCheck className="h-5 w-5 text-[#6c5e06]" />
              <h4 className="font-bold text-neutral-900">Khách hàng</h4>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 ring-4 ring-neutral-50">
                <img src={order.customerAvatar || ""} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-neutral-900 truncate">{order.customerName || "Khách hàng"}</p>
                <p className="text-xs text-neutral-400 font-medium truncate">{order.email || "No email"}</p>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex gap-3 items-start text-sm">
                <MapPin className="h-5 w-5 text-neutral-300 shrink-0" />
                <p className="text-neutral-600 font-medium leading-relaxed">{order.address || "No address"}</p>
              </div>
              <div className="flex gap-3 items-center text-sm">
                <Phone className="h-5 w-5 text-neutral-300 shrink-0" />
                <p className="text-neutral-600 font-bold">{order.phone || "No phone"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-50 pb-4">
              <CreditCard className="h-5 w-5 text-[#6c5e06]" />
              <h4 className="font-bold text-neutral-900">Thanh toán</h4>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400 font-medium">Hình thức</span>
              <span className="font-bold text-neutral-900 uppercase">{order.paymentMethod || "COD"}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-50 pb-4">
              <Truck className="h-5 w-5 text-[#6c5e06]" />
              <h4 className="font-bold text-neutral-900">Hành trình</h4>
            </div>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#6c5e06] text-white flex items-center justify-center">
                      {order.status !== OrderStatus.CANCELLED ? <CircleCheck className="h-4 w-4" /> : <OctagonAlert className="h-4 w-4" />}
                    </div>
                    <div className="w-0.5 h-10 bg-[#6c5e06]/10"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{order.status !== OrderStatus.CANCELLED ? "Tiếp nhận" : "Đã hủy"}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">{order.timeline?.confirmed?.time || order.date}</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-300 flex items-center justify-center"><Truck className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-neutral-400">Vận chuyển</p>
                    <p className="text-[10px] text-neutral-300 font-bold uppercase mt-0.5">Chờ bàn giao</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-300 flex items-center justify-center"><Sparkles className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-neutral-400">Hoàn tất</p>
                    <p className="text-[10px] text-neutral-300 font-bold uppercase mt-0.5">Chưa giao</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
