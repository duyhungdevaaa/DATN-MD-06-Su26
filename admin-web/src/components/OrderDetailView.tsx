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
<<<<<<< HEAD
  OctagonAlert,
  Phone
=======
  AlertOctagon,
  FileText,
  Package,
  Coins
>>>>>>> origin/main
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderDetailViewProps {
  order: Order;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onCancel: () => void;
  onApproveRefund?: (orderId: string) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onUpdateOrderStatus,
  onCancel,
  onApproveRefund
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
<<<<<<< HEAD
      case OrderStatus.PENDING: return "bg-amber-50 text-amber-600 border-amber-100";
      case OrderStatus.SHIPPING: return "bg-orange-50 text-orange-600 border-orange-100";
      case OrderStatus.DELIVERED: return "bg-green-50 text-green-600 border-green-100";
      default: return "bg-red-50 text-red-600 border-red-100";
=======
      case OrderStatus.AWAITING_PAYMENT:
        return "bg-amber-50 text-amber-700 border-amber-300";
      case OrderStatus.PROCESSING:
        return "bg-purple-50 text-purple-700 border-purple-300";
      case OrderStatus.SHIPPING:
        return "bg-sky-50 text-sky-700 border-sky-300";
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-700 border-green-300";
      case OrderStatus.REFUNDED:
        return "bg-rose-50 text-rose-700 border-rose-300";
      case OrderStatus.REFUND_COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      default:
        return "bg-red-50 text-red-700 border-red-300"; // Cancelled
>>>>>>> origin/main
    }
  };

  const handlePrintMock = () => {
    setShowInvoicePrintAlert(true);
    setTimeout(() => {
      setShowInvoicePrintAlert(false);
      window.print();
    }, 1500);
  };

  // Render contextual transition actions based on the current state according to business rules
  const renderWorkflowActions = () => {
    switch (order.status) {
      case OrderStatus.AWAITING_PAYMENT:
        return (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.PROCESSING)}
              className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl bg-[#8c7623] hover:bg-[#72601c] text-white transition-all cursor-pointer shadow-sm border border-transparent"
            >
              Xác nhận đơn hàng
            </button>
            <button
              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.CANCELLED)}
              className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer"
            >
              Hủy đơn hàng
            </button>
          </div>
        );

      case OrderStatus.PROCESSING:
        return (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.SHIPPING)}
              className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl bg-[#8c7623] hover:bg-[#72601c] text-white transition-all cursor-pointer shadow-sm border border-transparent"
            >
              Sẵn sàng giao hàng (Bàn giao vận chuyển)
            </button>
            <button
              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.CANCELLED)}
              className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer"
            >
              Hủy đơn hàng
            </button>
          </div>
        );

      case OrderStatus.SHIPPING:
        return (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.DELIVERED)}
              className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-sm border border-transparent"
            >
              Xác nhận phát thành công (Hoàn thành)
            </button>
            <button
              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.REFUNDED)}
              className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100/50 transition-all cursor-pointer"
            >
              Trả hàng / Hoàn đơn (Sự cố giao hàng)
            </button>
          </div>
        );

      case OrderStatus.DELIVERED:
        return (
          <div className="space-y-4">
            <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đơn hàng đã hoàn thành và hạch toán doanh thu thành công.</span>
            </div>
          </div>
        );

      case OrderStatus.CANCELLED:
        return (
          <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-3.5 rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Đơn hàng này đã bị hủy. Hệ thống đã tự động hoàn trả số lượng tồn kho.</span>
          </div>
        );

      case OrderStatus.REFUNDED:
        return (
          <div className="space-y-4">
            <div className="text-xs text-zinc-650 font-semibold bg-zinc-50 border border-zinc-150 p-3.5 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>Yêu cầu trả hàng / hoàn tiền đang chờ duyệt.</span>
            </div>
            {onApproveRefund && (
              <button
                onClick={() => onApproveRefund(order.id)}
                className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-sm border border-transparent"
              >
                Duyệt hoàn trả & Hoàn tiền vào Ví
              </button>
            )}
          </div>
        );
      case OrderStatus.REFUND_COMPLETED:
        return (
          <div className="space-y-4">
            <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đã hoàn tiền vào ví TrendifyPay thành công.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-left pb-12 font-sans">
      
      {/* Return & Action ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-wider font-sans transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách đơn hàng
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintMock}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all shadow-sm"
          >
            <Printer className="h-4 w-4 text-zinc-500" />
            In hóa đơn biên lai
          </button>
        </div>
>>>>>>> origin/main
      </div>

      {showInvoicePrintAlert && (
<<<<<<< HEAD
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
          <div className="bg-white p-4 rounded-xl shadow-2xl text-center space-y-2 max-w-[240px] border border-neutral-100">
            <Printer className="h-5 w-5 text-green-600 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-neutral-900">Khởi động máy in...</h4>
=======
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-8 rounded-2xl border border-zinc-150 shadow-2xl text-center space-y-4 max-w-xs ring-1 ring-black/5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce border border-emerald-100">
              <Printer className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-zinc-900">Đang khởi tạo máy in...</h4>
            <p className="font-sans text-xs text-zinc-500 leading-relaxed font-medium">
              Dữ liệu của vận đơn #{order.id} đang được kết dịch sang định dạng văn bản hóa đơn đóng dấu đỏ Trendify.
            </p>
>>>>>>> origin/main
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        
<<<<<<< HEAD
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
=======
        {/* Left Column: List of items & Receipt values summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden">
            
            {/* Invoice Header details */}
            <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8c7623] animate-pulse" />
                  <span className="font-mono text-[9px] tracking-[0.25em] text-[#8c7623] uppercase font-bold">
                    Mã chuẩn giao dịch
                  </span>
                </div>
                <h3 className="font-serif text-2xl tracking-normal text-zinc-950 font-bold mt-2">
                  Mã số: #{order.id}
                </h3>
                <span className="font-sans text-xs text-zinc-400 mt-1 block font-bold">
                  Ý nguyện lập đặt lúc: {order.date} • {order.time}
                </span>
              </div>

              {/* Status pill inside sheet */}
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold font-sans border tracking-wide inline-block ${
                order.status === OrderStatus.AWAITING_PAYMENT
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : order.status === OrderStatus.PROCESSING
                  ? "bg-purple-50 text-purple-700 border-purple-100"
                  : order.status === OrderStatus.SHIPPING
                  ? "bg-sky-50 text-sky-700 border-sky-100"
                  : order.status === OrderStatus.DELIVERED
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : order.status === OrderStatus.REFUNDED
                  ? "bg-rose-50 text-rose-700 border-rose-100"
                  : order.status === OrderStatus.REFUND_COMPLETED
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}>
                {order.status}
              </span>
            </div>

            {/* Breakdown item list details */}
            <div className="p-8 divide-y divide-zinc-100">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans pb-4">
                Danh sách vật phẩm thanh toán ({order.items.length})
              </p>

              {order.items.map((item, idx) => {
                return (
                  <div key={idx} className="py-5 flex items-start gap-4 hover:bg-zinc-50/30 transition-colors rounded-xl px-3 border-none">
                    {/* Item Image */}
                    <div className="w-16 h-20 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200 shrink-0 shadow-sm">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200";
                        }}
                      />
                    </div>

                    {/* Meta information */}
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-serif text-base text-zinc-900 font-bold tracking-tight">
                        {item.name}
                      </h4>
                      <p className="font-mono text-[9px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">
                        SKU: {item.sku}
                      </p>
                      
                      {/* Sub specs tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.size && (
                          <span className="font-sans text-[10px] bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded-lg font-bold">
                            Kích cỡ: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="font-sans text-[10px] bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded-lg font-bold">
                            Màu sắc: {item.color}
                          </span>
                        )}
                        <span className="font-sans text-[10px] bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded-lg font-bold">
                          Số lượng: {item.quantity} chiếc
                        </span>
>>>>>>> origin/main
                      </div>
                    </div>
                    <div className="text-right">
<<<<<<< HEAD
                      <p className="font-bold text-neutral-900 text-[12px]">{formatVND(item?.price)}</p>
=======
                      <p className="font-mono text-xs font-bold text-zinc-950">
                        {formatVND(item.price)}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-1 font-bold">
                        Tạm tính: {formatVND(item.price * item.quantity)}
                      </p>
>>>>>>> origin/main
                    </div>
                  </div>
<<<<<<< HEAD
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
=======
                );
              })}
            </div>

            {/* Calculations total receipt panel */}
            <div className="p-8 bg-zinc-50/50 border-t border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-sans font-semibold">Tạm tính giá trị tủ đồ:</span>
                <span className="text-xs font-mono font-bold text-zinc-900">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-sans font-semibold">Vận chuyển hỏa tốc Express (GHTK VIP):</span>
                <span className="text-xs font-mono text-zinc-650 font-bold">{formatVND(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-sans font-semibold">Chiết khấu đặc quyền thành viên VIP:</span>
                <span className="text-xs font-mono text-emerald-600 font-bold">-0 ₫</span>
              </div>
              
              <div className="h-[1px] bg-zinc-200/60 my-2" />

              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-bold text-zinc-950">TỔNG KHẨU TRỪ:</span>
                <span className="font-mono text-lg font-bold text-[#8c7623]">{formatVND(order.total)}</span>
              </div>
            </div>

          </div>

          {/* Workflow Status Manager controls */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200/50 shadow-sm space-y-4">
            <h4 className="font-serif text-lg text-zinc-900 font-bold">
              Chuyển tiếp giai đoạn xử lý Đơn hàng
            </h4>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed font-medium">
              Quyết định giai đoạn của vận đơn theo đúng quy trình nghiệp vụ. Hệ thống sẽ ngay lập tức đồng bộ hóa thông báo đến khách hàng và cập nhật lộ trình giao hàng trực tuyến.
            </p>

            <div className="pt-2">
              {renderWorkflowActions()}
>>>>>>> origin/main
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

<<<<<<< HEAD
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
=======
        {/* Right Column: Recipient specs card & System delivery timeline logs */}
        <div className="space-y-6">
          
          {/* Client Recipient metadata */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
              <UserCheck className="h-4.5 w-4.5 text-[#8c7623]" />
              <h4 className="font-serif text-base text-zinc-950 font-bold">
                Thông tin người nhận
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-50 ring-4 ring-zinc-100 shrink-0">
                <img 
                  src={order.customerAvatar} 
                  alt={order.customerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-850 truncate font-sans">
                  {order.customerName}
                </p>
                <span className="text-[10px] text-zinc-400 block mt-0.5 truncate max-w-[170px] font-bold">
                  {order.email}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100 text-xs text-left">
              <div className="flex gap-2.5">
                <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-700">Địa chỉ giao hàng</p>
                  <p className="text-zinc-500 leading-relaxed mt-1 font-medium">{order.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-4 text-zinc-400 shrink-0 font-bold text-center">☎</span>
                <div>
                  <p className="font-bold text-zinc-700">Số điện thoại liên hệ</p>
                  <p className="text-zinc-500 mt-0.5 font-medium">{order.phone}</p>
                </div>
>>>>>>> origin/main
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-[#6c5e06]" />
              <h4 className="font-bold text-neutral-900 text-xs">Thanh toán</h4>
=======
          {/* Secure Payment details */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
              <CreditCard className="h-4.5 w-4.5 text-[#8c7623]" />
              <h4 className="font-serif text-base text-zinc-950 font-bold">
                Cổng thanh toán điện tử
              </h4>
            </div>

            <div className="space-y-2.5 text-xs font-sans text-zinc-500 font-semibold">
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <strong className="text-zinc-850 font-bold">{order.paymentMethod}</strong>
              </div>
              <div className="flex justify-between mt-1.5 pt-1.5 border-t border-zinc-100">
                <span className="text-rose-500 font-bold">Tiền thu hộ (COD):</span>
                <strong className="text-rose-600 font-bold text-sm">
                  {order.paymentMethod === 'Thanh toán khi nhận hàng' 
                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)
                    : '0 ₫'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Cổng xử lý:</span>
                <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] font-bold">PayOS / Trendify</strong>
              </div>
>>>>>>> origin/main
            </div>
            <span className="font-bold text-neutral-900 uppercase text-[10px]">{order.paymentMethod || "COD"}</span>
          </div>

<<<<<<< HEAD
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
=======
          {/* Visual Step-by-Step Delivery Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/50 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
              <Truck className="h-4.5 w-4.5 text-[#8c7623]" />
              <h4 className="font-serif text-base text-zinc-950 font-bold">
                Thời trình hoàn thiện vận đơn
              </h4>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Stage 1: Khởi tạo Vận đơn */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm ${
                    order.status === OrderStatus.CANCELLED
                      ? 'bg-rose-500'
                      : order.status !== OrderStatus.AWAITING_PAYMENT
                      ? 'bg-[#8c7623]'
                      : 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                  }`}>
                    <FileText className="h-3 w-3" />
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status !== OrderStatus.AWAITING_PAYMENT && order.status !== OrderStatus.CANCELLED ? 'bg-[#8c7623]' : 'bg-zinc-200/60'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">Giai đoạn 1: Khởi tạo Vận đơn (Created)</p>
                  <p className="text-[10px] text-zinc-450 font-sans mt-0.5 font-bold">
                    {order.status === OrderStatus.CANCELLED
                      ? "Đã hủy đơn"
                      : order.status !== OrderStatus.AWAITING_PAYMENT
                      ? `Mã vận đơn: TRN-${order.id.substring(0, 8).toUpperCase()} (Chờ lấy hàng)`
                      : "Chờ xác nhận đơn hàng"}
                  </p>
                </div>
              </div>

              {/* Stage 2: Chuẩn bị & Dán nhãn */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm ${
                    order.status === OrderStatus.CANCELLED
                      ? 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                      : order.status !== OrderStatus.AWAITING_PAYMENT
                      ? 'bg-[#8c7623]'
                      : 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                  }`}>
                    <Package className={`h-3 w-3 ${
                      order.status !== OrderStatus.AWAITING_PAYMENT && order.status !== OrderStatus.CANCELLED ? 'text-white' : 'text-zinc-400'
                    }`} />
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED ? 'bg-[#8c7623]' : 'bg-zinc-200/60'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">Giai đoạn 2: Chuẩn bị & Dán nhãn (Packed)</p>
                  <p className="text-[10px] text-zinc-450 font-sans mt-0.5 font-bold">
                    {order.status === OrderStatus.CANCELLED
                      ? "Đã đình bản đóng gói"
                      : order.status !== OrderStatus.AWAITING_PAYMENT
                      ? "Trạng thái: Sẵn sàng bàn giao (Đã dán nhãn)"
                      : "Chờ hoàn tất đóng gói"}
                  </p>
                </div>
              </div>

              {/* Stage 3: Bàn giao vận chuyển */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm ${
                    order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED
                      ? 'bg-[#8c7623]'
                      : 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                  }`}>
                    <Truck className={`h-3 w-3 ${
                      order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED ? 'text-white' : 'text-zinc-400'
                    }`} />
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED ? 'bg-[#8c7623]' : 'bg-zinc-200/60'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">Giai đoạn 3: Bàn giao vận chuyển (Dispatched)</p>
                  <p className="text-[10px] text-zinc-450 font-sans mt-0.5 font-bold">
                    {order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED
                      ? "Trạng thái: Đang vận chuyển (In Transit)"
                      : order.status === OrderStatus.CANCELLED
                      ? "Đã thu hồi vận đơn"
                      : "Chờ đối tác vận chuyển GHTK VIP quét mã lấy hàng"}
                  </p>
                </div>
              </div>

              {/* Stage 4: Phát hàng thành công */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm ${
                    order.status === OrderStatus.DELIVERED
                      ? 'bg-emerald-600'
                      : order.status === OrderStatus.REFUNDED
                      ? 'bg-rose-500'
                      : 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                  }`}>
                    <CheckCircle2 className={`h-3 w-3 ${
                      order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED ? 'text-white' : 'text-zinc-400'
                    }`} />
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED ? 'bg-emerald-600' : 'bg-zinc-200/60'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">Giai đoạn 4: Phát hàng thành công (Delivered)</p>
                  <p className="text-[10px] text-zinc-450 font-sans mt-0.5 font-bold">
                    {order.status === OrderStatus.DELIVERED
                      ? "Trạng thái: Giao thành công (Khách đã ký nhận)"
                      : order.status === OrderStatus.REFUNDED
                      ? "Trạng thái: Giao hàng thất bại / Trả hàng hoàn về kho"
                      : "Chờ bàn giao khách hàng"}
                  </p>
                </div>
              </div>

              {/* Stage 5: Đối soát & Đóng vận đơn */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm ${
                    order.status === OrderStatus.DELIVERED
                      ? 'bg-emerald-600'
                      : order.status === OrderStatus.REFUNDED
                      ? 'bg-zinc-500'
                      : 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                  }`}>
                    <Coins className={`h-3 w-3 ${
                      order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED ? 'text-white' : 'text-zinc-400'
                    }`} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">Giai đoạn 5: Đối soát tài chính (Closed)</p>
                  <p className="text-[10px] text-zinc-450 font-sans mt-0.5 font-bold">
                    {order.status === OrderStatus.DELIVERED
                      ? "Trạng thái: Đã đối soát tiền COD & Đóng vận đơn"
                      : order.status === OrderStatus.REFUNDED
                      ? "Trạng thái: Đã hoàn tiền khách hàng & Thu hồi kho"
                      : "Chờ đối soát doanh thu & phí vận chuyển"}
                  </p>
                </div>
              </div>

>>>>>>> origin/main
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
