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
        return "bg-amber-50 text-amber-600 border-amber-100";
      case OrderStatus.SHIPPING:
        return "bg-orange-50 text-orange-600 border-orange-100";
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-red-50 text-red-600 border-red-100";
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-left pb-12 font-sans">
      
      {/* Return & Action ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-[15px] font-medium text-[#6B7280] hover:text-[#111827] transition-all group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách đơn hàng
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintMock}
            className="h-[40px] px-4 rounded-[10px] bg-white hover:bg-neutral-50 text-[#111827] border border-[#E5E7EB] text-[15px] font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Printer className="h-4 w-4 text-[#6B7280]" />
            In hóa đơn biên lai
          </button>
        </div>
      </div>

      {/* Simulated invoice modal pop */}
      {showInvoicePrintAlert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in px-4">
          <div className="bg-white p-10 rounded-[12px] border border-[#E5E7EB] shadow-2xl text-center space-y-5 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto animate-bounce">
              <Printer className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-[#111827]">Đang khởi tạo máy in...</h4>
            <p className="text-[14px] text-[#6B7280] leading-relaxed">
              Dữ liệu của vận đơn #{order.id} đang được kết dịch sang định dạng văn bản hóa đơn đóng dấu đỏ Trendify.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: List of items & Receipt values summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            
            {/* Invoice Header details */}
            <div className="p-8 border-b border-[#E5E7EB] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F9FAFB]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6c5e06]" />
                  <span className="text-[12px] font-bold text-[#6c5e06] uppercase tracking-wider">
                    MÃ CHUẨN GIAO DỊCH
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#111827] mt-2">
                  #{order.id}
                </h3>
                <span className="text-[14px] font-normal text-[#6B7280] mt-1 block">
                  Lập đơn lúc: {order.date} • {order.time}
                </span>
              </div>

              {/* Status pill inside sheet */}
              <span className={`px-[14px] py-[6px] rounded-full text-[13px] font-semibold border tracking-wide inline-block ${getBadgeColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Breakdown item list details */}
            <div className="p-8 divide-y divide-[#F3F4F6]">
              <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest pb-4">
                DANH SÁCH VẬT PHẨM ({order.items.length})
              </p>

              {order.items.map((item, idx) => {
                return (
                  <div key={idx} className="py-6 flex items-start gap-5 hover:bg-neutral-50/50 transition-colors rounded-xl px-2 -mx-2">
                    {/* Item Image */}
                    <div className="w-20 h-24 bg-neutral-50 rounded-[10px] overflow-hidden border border-[#E5E7EB] shrink-0 shadow-sm">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Meta information */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[16px] text-[#111827] font-bold tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-[12px] font-bold text-[#6B7280] mt-1 uppercase tracking-wider">
                        SKU: {item.sku}
                      </p>
                      
                      {/* Sub specs tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {item.size && (
                          <span className="text-[12px] bg-neutral-100 text-[#6B7280] px-2 py-0.5 rounded font-bold">
                            SIZE: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[12px] bg-neutral-100 text-[#6B7280] px-2 py-0.5 rounded font-bold">
                            MÀU: {item.color}
                          </span>
                        )}
                        <span className="text-[12px] bg-neutral-100 text-[#6B7280] px-2 py-0.5 rounded font-bold">
                          SL: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Numeric and calculated prices */}
                    <div className="text-right">
                      <p className="text-[15px] font-bold text-[#111827]">
                        {formatVND(item.price)}
                      </p>
                      <p className="text-[12px] text-[#6B7280] font-medium mt-1">
                        Tạm tính: {formatVND(item.price * item.quantity)}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Calculations total receipt panel */}
            <div className="p-8 bg-[#F9FAFB] border-t border-[#E5E7EB] space-y-4">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#6B7280] font-medium">Tạm tính:</span>
                <span className="font-bold text-[#111827]">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#6B7280] font-medium">Phí vận chuyển:</span>
                <span className="font-bold text-[#111827]">{formatVND(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#6B7280] font-medium">Giảm giá hội viên:</span>
                <span className="font-bold text-emerald-600">-0 ₫</span>
              </div>
              
              <div className="h-[1px] bg-[#E5E7EB] my-2" />

              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#111827]">TỔNG THANH TOÁN:</span>
                <span className="text-[22px] font-bold text-[#111827]">{formatVND(order.total)}</span>
              </div>
            </div>

          </div>

          {/* Workflow Status Manager controls */}
          <div className="bg-white p-8 rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-5">
            <div>
              <h4 className="text-[18px] text-[#111827] font-bold tracking-tight">
                Chuyển tiếp giai đoạn xử lý
              </h4>
              <p className="text-[14px] text-[#6B7280] mt-1">
                Quyết định trạng thái của vận đơn này. Hệ thống sẽ tự động gửi thông báo đến khách hàng.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {Object.values(OrderStatus).map((statusOpt) => {
                const isCurrentStatus = order.status === statusOpt;
                return (
                  <button
                    key={statusOpt}
                    onClick={() => onUpdateOrderStatus(order.id, statusOpt)}
                    className={`h-[40px] px-2 rounded-[10px] text-[13px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                      isCurrentStatus
                        ? "bg-[#6c5e06] text-white border-transparent shadow-lg shadow-[#6c5e06]/20"
                        : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-neutral-50"
                    }`}
                  >
                    {statusOpt}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Recipient specs card & System delivery timeline logs */}
        <div className="space-y-6">
          
          {/* Client Recipient metadata */}
          <div className="bg-white p-6 rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-6">
            <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
              <UserCheck className="h-5 w-5 text-[#6c5e06]" />
              <h4 className="text-[16px] text-[#111827] font-bold">
                Thông tin người nhận
              </h4>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 ring-4 ring-[#F3F4F6] shrink-0">
                <img 
                  src={order.customerAvatar} 
                  alt={order.customerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-[#111827] truncate">
                  {order.customerName}
                </p>
                <span className="text-[13px] font-medium text-[#6B7280] block mt-0.5 truncate max-w-[170px]">
                  {order.email || "marie.laurent@example.com"}
                </span>
              </div>
            </div>

            <div className="space-y-5 pt-2 text-[14px]">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-[#9CA3AF] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#111827]">Địa chỉ giao hàng</p>
                  <p className="text-[#6B7280] leading-relaxed mt-1">{order.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                <div>
                  <p className="font-bold text-[#111827]">Số điện thoại</p>
                  <p className="text-[#6B7280] mt-0.5">{order.phone || "0901 234 567"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Payment details */}
          <div className="bg-white p-6 rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-5">
            <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
              <CreditCard className="h-5 w-5 text-[#6c5e06]" />
              <h4 className="text-[16px] text-[#111827] font-bold">
                Cổng thanh toán
              </h4>
            </div>

            <div className="space-y-3 text-[14px]">
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] font-medium">Phương thức:</span>
                <span className="text-[#111827] font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] font-medium">Cổng xử lý:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[6px] text-[11px] font-bold">Stripe Secured</span>
              </div>
            </div>
          </div>

          {/* Visual Step-by-Step Delivery Timeline */}
          <div className="bg-white p-6 rounded-[12px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-6">
            <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
              <Truck className="h-5 w-5 text-[#6c5e06]" />
              <h4 className="text-[16px] text-[#111827] font-bold">
                Hành trình vận đơn
              </h4>
            </div>

            <div className="space-y-6 pt-2">
              {/* Confirmed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    order.status !== OrderStatus.CANCELLED ? 'bg-[#6c5e06]' : 'bg-rose-500'
                  }`}>
                    {order.status !== OrderStatus.CANCELLED ? <CheckCircle2 className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />}
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED ? 'bg-[#6c5e06]' : 'bg-neutral-100'
                  }`} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#111827]">
                    {order.status !== OrderStatus.CANCELLED ? "Tiếp nhận đơn hàng" : "Đã hủy đơn"}
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-medium mt-1">
                    {order.timeline.confirmed.time || "Hôm nay, 14:35"}
                  </p>
                </div>
              </div>

              {/* Shipping */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED ? 'bg-[#6c5e06] text-white' : 'bg-neutral-100 text-[#9CA3AF]'
                  }`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className={`w-[2px] h-10 ${
                    order.status === OrderStatus.DELIVERED ? 'bg-[#6c5e06]' : 'bg-neutral-100'
                  }`} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#111827]">Đang bàn giao GHTK</p>
                  <p className="text-[12px] text-[#6B7280] font-medium mt-1">
                    {order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED ? "Đang vận chuyển" : "Chờ xử lý"}
                  </p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    order.status === OrderStatus.DELIVERED ? 'bg-green-600 text-white' : 'bg-neutral-100 text-[#9CA3AF]'
                  }`}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#111827]">Giao hàng thành công</p>
                  <p className="text-[12px] text-[#6B7280] font-medium mt-1">
                    {order.status === OrderStatus.DELIVERED ? "Hoàn tất hành trình" : "Chưa hoàn thành"}
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
