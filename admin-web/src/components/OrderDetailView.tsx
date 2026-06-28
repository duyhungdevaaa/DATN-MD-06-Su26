/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Printer, 
  ChevronRight, 
  MapPin, 
  UserCheck, 
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertOctagon
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

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Status badge style helper
  const getBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-300";
      case OrderStatus.SHIPPING:
        return "bg-sky-50 text-sky-700 border-sky-300";
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-700 border-green-300";
      default:
        return "bg-red-50 text-red-700 border-red-300";
    }
  };

  // Trigger simulated receipt printing block
  const handlePrintMock = () => {
    setShowInvoicePrintAlert(true);
    setTimeout(() => {
      setShowInvoicePrintAlert(false);
      window.print(); // triggers native print screen in case they open in new tab!
    }, 1800);
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
            <button
              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.REFUNDED)}
              className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer"
            >
              Yêu cầu trả hàng / Hoàn tiền
            </button>
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
          <div className="text-xs text-zinc-650 font-semibold bg-zinc-50 border border-zinc-150 p-3.5 rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>Đơn hàng đã được trả lại và hoàn tiền thành công.</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-left pb-12">
      
      {/* Return & Action ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#1b1c1c] uppercase tracking-wider font-sans transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách đơn hàng
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintMock}
            className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider font-sans transition-all"
          >
            <Printer className="h-4 w-4 text-neutral-500" />
            In hóa đơn biên lai
          </button>
        </div>
      </div>

      {/* Simulated invoice modal pop */}
      {showInvoicePrintAlert && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-8 rounded-xl border border-neutral-200 shadow-2xl text-center space-y-4 max-w-xs">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto animate-bounce">
              <Printer className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-neutral-900">Đang khởi tạo máy in...</h4>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed">
              Dữ liệu của vận đơn #{order.id} đang được kết dịch sang định dạng văn bản hóa đơn đóng dấu đỏ Trendify.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: List of items & Receipt values summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#cfc4c5]/40 custom-shadow overflow-hidden">
            
            {/* Invoice Header details */}
            <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#fbf9f9]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6c5e06]" />
                  <span className="font-mono text-[9px] tracking-[0.25em] text-[#6c5e06] uppercase font-bold">
                    Mã chuẩn giao dịch
                  </span>
                </div>
                <h3 className="font-serif text-2xl tracking-normal text-neutral-950 font-bold mt-2">
                  Mã số: #{order.id}
                </h3>
                <span className="font-sans text-xs text-neutral-400 mt-1 block">
                  Ý nguyện lập đặt lúc: {order.date} • {order.time}
                </span>
              </div>

              {/* Status pill inside sheet */}
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold font-sans border tracking-wide inline-block ${getBadgeColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Breakdown item list details */}
            <div className="p-8 divide-y divide-neutral-100">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans pb-4">
                Danh sách vật phẩm thanh toán ({order.items.length})
              </p>

              {order.items.map((item, idx) => {
                return (
                  <div key={idx} className="py-5 flex items-start gap-4 hover:bg-neutral-50/40 transition-colors rounded-lg px-2">
                    {/* Item Image */}
                    <div className="w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-base text-neutral-900 font-medium tracking-tight">
                        {item.name}
                      </h4>
                      <p className="font-mono text-[9px] text-neutral-400 mt-1 uppercase tracking-widest">
                        SKU: {item.sku}
                      </p>
                      
                      {/* Sub specs tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.size && (
                          <span className="font-sans text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-medium">
                            Kích cỡ: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="font-sans text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-medium">
                            Màu sắc: {item.color}
                          </span>
                        )}
                        <span className="font-sans text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-medium">
                          Số lượng: {item.quantity} chiếc
                        </span>
                      </div>
                    </div>

                    {/* Numeric and calculated prices */}
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-neutral-950">
                        {formatVND(item.price)}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">
                        Tạm tính: {formatVND(item.price * item.quantity)}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Calculations total receipt panel */}
            <div className="p-8 bg-[#fbf9f9] border-t border-neutral-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-sans">Tạm tính giá trị tủ đồ:</span>
                <span className="text-xs font-mono font-semibold text-neutral-900">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-sans">Vận chuyển hỏa tốc Express (GHTK VIP):</span>
                <span className="text-xs font-mono text-neutral-600">{formatVND(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-sans">Chiết khấu đặc quyền thành viên VIP:</span>
                <span className="text-xs font-mono text-emerald-600 font-bold">-0 ₫</span>
              </div>
              
              <div className="h-[1px] bg-neutral-200 my-2" />

              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-medium text-neutral-900">TỔNG KHẨU TRỪ:</span>
                <span className="font-mono text-lg font-bold text-[#6c5e06]">{formatVND(order.total)}</span>
              </div>
            </div>

          </div>

          {/* Workflow Status Manager controls */}
          <div className="bg-white p-8 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-4">
            <h4 className="font-serif text-lg text-neutral-900 font-medium">
              Chuyển tiếp giai đoạn xử lý Đơn hàng
            </h4>
            <p className="font-sans text-xs text-neutral-400">
              Quyết định trạng thái của vận đơn này. Hệ thống sẽ ngay lập tức đồng bộ hóa thông báo đến khách hàng và cập nhật lộ trình giao hàng trực tuyến.
            </p>

            <div className="pt-2">
              {renderWorkflowActions()}
            </div>
          </div>

        </div>

        {/* Right Column: Recipient specs card & System delivery timeline logs */}
        <div className="space-y-6">
          
          {/* Client Recipient metadata */}
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-150 pb-4">
              <UserCheck className="h-4.5 w-4.5 text-[#6c5e06]" />
              <h4 className="font-serif text-base text-neutral-900 font-medium">
                Thông tin người nhận
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 ring-4 ring-[#cfc4c5]/25 shrink-0">
                <img 
                  src={order.customerAvatar} 
                  alt={order.customerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-800 truncate font-sans">
                  {order.customerName}
                </p>
                <span className="text-[10px] text-neutral-400 block mt-0.5 truncate max-w-[170px]">
                  {order.email}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-100 text-xs">
              <div className="flex gap-2.5">
                <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-bold text-neutral-700">Địa chỉ giao hàng</p>
                  <p className="text-neutral-500 leading-relaxed mt-1">{order.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-4 text-neutral-400 shrink-0 font-bold text-center">☎</span>
                <div className="text-left">
                  <p className="font-bold text-neutral-700">Số điện thoại liên hệ</p>
                  <p className="text-neutral-500 mt-0.5">{order.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Payment details */}
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-150 pb-4">
              <CreditCard className="h-4.5 w-4.5 text-[#6c5e06]" />
              <h4 className="font-serif text-base text-neutral-900 font-medium">
                Cổng thanh toán điện tử
              </h4>
            </div>

            <div className="space-y-2 text-xs font-sans text-neutral-600">
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <strong className="text-neutral-850 font-bold">{order.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span>Chi tiết thẻ:</span>
                <strong className="text-neutral-800 font-mono text-[11px] font-semibold">{order.paymentEndingCard}</strong>
              </div>
              <div className="flex justify-between">
                <span>Cổng xử lý:</span>
                <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">Stripe Secured</strong>
              </div>
            </div>
          </div>

          {/* Visual Step-by-Step Delivery Timeline */}
          <div className="bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-150 pb-4">
              <Truck className="h-4.5 w-4.5 text-[#6c5e06]" />
              <h4 className="font-serif text-base text-neutral-900 font-medium">
                Thời trình hoàn thiện vận đơn
              </h4>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Confirmed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                    order.status !== OrderStatus.CANCELLED ? 'bg-[#6c5e06]' : 'bg-rose-500'
                  }`}>
                    {order.status !== OrderStatus.CANCELLED ? <CheckCircle2 className="h-3 w-3" /> : <AlertOctagon className="h-3 w-3" />}
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED ? 'bg-[#6c5e06]' : 'bg-neutral-200'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-neutral-800">
                    {order.status !== OrderStatus.CANCELLED ? "Đã tiếp nhận yêu cầu" : "Bản hủy đơn hàng"}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {order.timeline.confirmed.time || "Hôm nay, 14:35"}
                  </p>
                </div>
              </div>

              {/* Packing */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                    order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED ? 'bg-[#6c5e06]' : 'bg-neutral-200'
                  }`}>
                    <Clock className="h-3 w-3 text-neutral-400" />
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status === OrderStatus.DELIVERED ? 'bg-[#6c5e06]' : 'bg-neutral-200'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-neutral-800">Duyệt & Đóng gói sản phẩm</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED 
                      ? order.timeline.packing.time || "Hôm nay, 15:00" 
                      : order.status === OrderStatus.CANCELLED ? "Đã đình bản" : "Chờ lấy hàng dệt thủ công"}
                  </p>
                </div>
              </div>

              {/* Shipping */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                    order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED ? 'bg-[#6c5e06]' : 'bg-neutral-200'
                  }`}>
                    <Truck className="h-3 w-3 text-neutral-400" />
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status === OrderStatus.DELIVERED ? 'bg-[#6c5e06]' : 'bg-neutral-200'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-neutral-800">Đấu nối đối tác GHTK VIP</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED 
                      ? "Đang dạt hành trình" 
                      : order.status === OrderStatus.CANCELLED ? "Đã thu hồi" : "Đang kết nối kho"}
                  </p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                    order.status === OrderStatus.DELIVERED ? 'bg-green-600' : 'bg-neutral-200'
                  }`}>
                    ★
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-neutral-800">Bàn giao hội viên hoàn tất</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {order.status === OrderStatus.DELIVERED ? order.timeline.delivered.time || "Xong" : "Tài liệu đang xử lý"}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
