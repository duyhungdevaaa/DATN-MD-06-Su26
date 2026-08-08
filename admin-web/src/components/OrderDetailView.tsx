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
  Phone,
  User as UserIcon,
  Clock,
  Package,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderDetailViewProps {
  order: Order;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onCancel: () => void;
  onApproveRefund: (orderId: string) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onUpdateOrderStatus,
  onCancel,
  onApproveRefund
}) => {
  const [showInvoicePrintAlert, setShowInvoicePrintAlert] = useState(false);

  if (!order) return null;

  const formatVND = (num: any) => {
    const val = typeof num === 'number' ? num : parseFloat(num) || 0;
    return new Intl.NumberFormat("vi-VN").format(val) + " ₫";
  };

  const getStatusBadgeConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PROCESSING: return { color: "text-amber-600 bg-amber-50 border-amber-100", dot: "bg-amber-500" };
      case OrderStatus.SHIPPING: return { color: "text-sky-600 bg-sky-50 border-sky-100", dot: "bg-sky-500" };
      case OrderStatus.DELIVERED: return { color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" };
      case OrderStatus.CANCELLED: return { color: "text-rose-600 bg-rose-50 border-rose-100", dot: "bg-rose-500" };
      case OrderStatus.AWAITING_PAYMENT: return { color: "text-zinc-500 bg-zinc-50 border-zinc-100", dot: "bg-zinc-400" };
      case OrderStatus.REFUNDED: return { color: "text-purple-600 bg-purple-50 border-purple-100", dot: "bg-purple-500" };
      case OrderStatus.REFUND_COMPLETED: return { color: "text-zinc-600 bg-zinc-50 border-zinc-200", dot: "bg-zinc-600" };
      default: return { color: "text-zinc-500 bg-zinc-50 border-zinc-200", dot: "bg-zinc-400" };
    }
  };

  const handlePrintMock = () => {
    setShowInvoicePrintAlert(true);
    setTimeout(() => {
      setShowInvoicePrintAlert(false);
      window.print();
    }, 1500);
  };

  const badge = getStatusBadgeConfig(order.status);

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans max-w-[1400px] mx-auto pb-12">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-950 font-bold text-[11px] uppercase tracking-widest transition-all group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách đơn hàng
          </button>

          <div className="flex items-center gap-4">
             <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Mã vận đơn hệ thống</p>
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black text-zinc-950 tracking-tighter">#{order.id}</h2>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold ${badge.color} shadow-xs`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs mt-2 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{order.date} • {order.time}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {order.status === OrderStatus.REFUNDED && (
            <button
              onClick={() => onApproveRefund(order.id)}
              className="h-10 px-6 rounded-xl bg-rose-600 text-white text-[12px] font-bold uppercase tracking-wider hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all active:scale-95"
            >
              Phê duyệt hoàn tiền
            </button>
          )}
          <button
            onClick={handlePrintMock}
            className="h-10 px-6 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-[12px] font-bold uppercase tracking-wider hover:bg-zinc-50 shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Printer className="h-4 w-4 text-zinc-400" /> In hóa đơn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Products & Payment Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* 2. SẢN PHẨM TRONG ĐƠN */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-50 bg-zinc-50/30">
              <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Sản phẩm trong đơn ({order.items.length})</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-50 text-[10px] text-zinc-400 uppercase tracking-widest font-black bg-zinc-50/10">
                    <th className="p-5 pl-8">Sản phẩm</th>
                    <th className="p-5">Phân loại</th>
                    <th className="p-5 text-right">Đơn giá</th>
                    <th className="p-5 text-center">Số lượng</th>
                    <th className="p-5 pr-8 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="group transition-colors hover:bg-zinc-50/30">
                      <td className="p-5 pl-8 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-11 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0 shadow-xs">
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-zinc-900 truncate leading-tight">{item.name}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1.5 tracking-wider">SKU: {item.sku || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 align-middle">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded block w-fit">SIZE: {item.size || 'N/A'}</span>
                          <span className="text-[10px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded block w-fit uppercase">MÀU: {item.color || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-5 align-middle text-right">
                        <span className="text-[13px] font-bold text-zinc-900">{formatVND(item.price)}</span>
                      </td>
                      <td className="p-5 align-middle text-center">
                        <span className="text-[13px] font-bold text-zinc-900">x{item.quantity}</span>
                      </td>
                      <td className="p-5 pr-8 align-middle text-right">
                        <span className="text-[13px] font-black text-zinc-950">{formatVND(item.price * item.quantity)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 3. TỔNG TIỀN */}
            <div className="p-8 bg-zinc-50/40 border-t border-zinc-100 flex justify-end">
              <div className="w-full max-w-xs space-y-3.5">
                <div className="flex justify-between items-center text-xs font-medium text-zinc-500">
                  <span>Tạm tính:</span>
                  <span className="text-zinc-900 font-bold">{formatVND(order.subtotal)}</span>
                </div>

                {order.discountAmount && order.discountAmount > 0 ? (
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-zinc-500">Voucher giảm giá:</span>
                    <span className="text-rose-600 font-bold">-{formatVND(order.discountAmount)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between items-center text-xs font-medium text-zinc-500">
                  <span>Phí vận chuyển:</span>
                  <span className="text-zinc-900 font-bold">{formatVND(order.shippingFee)}</span>
                </div>

                {order.walletAmountUsed && order.walletAmountUsed > 0 ? (
                  <div className="flex justify-between items-center text-xs font-bold text-rose-600 bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                    <span>Ví TrendifyPay sử dụng:</span>
                    <span>-{formatVND(order.walletAmountUsed)}</span>
                  </div>
                ) : null}

                <div className="h-px bg-zinc-200 my-2" />

                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-black text-zinc-950 uppercase tracking-tighter">Tổng cộng:</span>
                  <span className="text-3xl font-black text-[#8c7623] tracking-tighter">{formatVND(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 9. CẬP NHẬT TRẠNG THÁI */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-4 w-4 text-[#8c7623]" />
              <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Cập nhật tiến độ đơn hàng</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(OrderStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateOrderStatus(order.id, s)}
                  className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                    order.status === s
                      ? "bg-zinc-950 text-white border-transparent shadow-xl shadow-black/20"
                      : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300 hover:text-zinc-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Info */}
        <div className="space-y-6">

          {/* 4. THÔNG TIN KHÁCH HÀNG + NGƯỜI NHẬN */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-4">
                <UserIcon className="h-5 w-5 text-[#8c7623]" />
                <h4 className="font-black text-zinc-900 uppercase text-xs tracking-widest">Thông tin khách hàng</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 ring-2 ring-zinc-50">
                  <img src={order.customerAvatar} alt={order.customerName} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 text-sm truncate">{order.customerName}</p>
                  <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">{order.email || "Chưa có email"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-zinc-50 pb-4">
                <UserCheck className="h-5 w-5 text-[#8c7623]" />
                <h4 className="font-black text-zinc-900 uppercase text-xs tracking-widest">Người nhận</h4>
              </div>
              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-start text-xs font-medium">
                  <span className="text-zinc-400 shrink-0">Họ và tên:</span>
                  <span className="text-zinc-900 font-bold text-right ml-4">{order.recipientName || order.customerName || "Chưa có dữ liệu"}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-zinc-400 shrink-0">Số điện thoại:</span>
                  <div className="flex items-center gap-1.5 text-zinc-950 font-bold">
                    <Phone className="h-3.5 w-3.5 text-[#8c7623] opacity-40" />
                    <span>{order.phone || "Chưa có dữ liệu"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Địa chỉ giao hàng:</span>
                  <div className="flex gap-2.5 items-start p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 shadow-inner">
                    <MapPin className="h-4 w-4 text-[#8c7623] shrink-0 mt-0.5" />
                    <p className="text-zinc-700 text-[11px] font-bold leading-relaxed">{order.address || "Chưa có dữ liệu"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. PHƯƠNG THỨC THANH TOÁN */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-4">
              <CreditCard className="h-5 w-5 text-[#8c7623]" />
              <h4 className="font-black text-zinc-900 uppercase text-xs tracking-widest">Thanh toán</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-zinc-400">Hình thức:</span>
                <span className="font-black text-zinc-950 uppercase tracking-tight">{order.paymentMethod}</span>
              </div>
              {order.walletAmountUsed && order.walletAmountUsed > 0 ? (
                <>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-zinc-400">Ví sử dụng:</span>
                    <span className="font-bold text-rose-600">-{formatVND(order.walletAmountUsed)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-dashed border-zinc-200 font-bold">
                    <span className="text-zinc-400">Còn lại thanh toán:</span>
                    <span className="text-zinc-950">{formatVND(order.total)}</span>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-100">
                <span className="text-zinc-400 font-medium">Trạng thái thanh toán:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-lg text-[10px] uppercase ${order.status === OrderStatus.AWAITING_PAYMENT ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>
                  {order.status === OrderStatus.AWAITING_PAYMENT ? "Chờ khớp lệnh" : "Đã xác thực"}
                </span>
              </div>
            </div>
          </div>

          {/* 7. VẬN CHUYỂN */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-4">
              <Truck className="h-5 w-5 text-[#8c7623]" />
              <h4 className="font-black text-zinc-900 uppercase text-xs tracking-widest">Vận chuyển</h4>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Đơn vị vận chuyển</p>
                <div className="flex items-center gap-2 pt-1">
                   <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white italic shadow-sm">GHTK</div>
                   <span className="text-xs font-bold text-zinc-900">Giao Hàng Tiết Kiệm</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Mã vận đơn</p>
                <p className="text-xs font-mono font-black text-[#8c7623] tracking-wider uppercase mt-1">GHTK-TREND-{order.id.substring(0, 8)}</p>
              </div>
              <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-100">
                <span className="text-zinc-400 font-medium">Phương thức:</span>
                <span className="font-bold text-zinc-950 uppercase">{order.address === "Tại cửa hàng" ? "Nhận tại cửa hàng" : "Giao hàng tận nơi"}</span>
              </div>
            </div>
          </div>

          {/* 8. HÀNH TRÌNH ĐƠN HÀNG */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-50 pb-4">
              <Clock className="h-5 w-5 text-[#8c7623]" />
              <h4 className="font-black text-zinc-900 uppercase text-xs tracking-widest">Hành trình đơn hàng</h4>
            </div>
            <div className="space-y-6 pl-2 relative">
               <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-zinc-50"></div>

               <div className="flex gap-4 relative z-10">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${badge.dot}`}></div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Tiếp nhận đơn</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1">{order.timeline.confirmed.time || order.date}</p>
                  </div>
               </div>

               <div className="flex gap-4 relative z-10 opacity-30">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white bg-zinc-200"></div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400">Đang xử lý</p>
                    <p className="text-[10px] text-zinc-300 font-medium mt-1">--:-- • --/--/----</p>
                  </div>
               </div>

               <div className="flex gap-4 relative z-10 opacity-30">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white bg-zinc-200"></div>
                  <p className="text-xs font-bold text-zinc-400">Đang giao hàng</p>
               </div>

               <div className="flex gap-4 relative z-10 opacity-30">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white bg-zinc-200"></div>
                  <p className="text-xs font-bold text-zinc-400">Đã giao hàng</p>
               </div>
            </div>
          </div>

        </div>
      </div>

      {showInvoicePrintAlert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm border border-neutral-100 scale-110">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
              <Printer className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900">Khởi động máy in...</h4>
            <p className="text-sm text-neutral-500 leading-relaxed font-medium">Hệ thống đang trích xuất dữ liệu hóa đơn chuẩn Haute Couture cho vận đơn #{order.id}.</p>
          </div>
        </div>
      )}

    </div>
  );
};
