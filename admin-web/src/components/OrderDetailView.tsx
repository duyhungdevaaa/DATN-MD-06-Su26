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
  AlertOctagon,
  FileText,
  Package,
  Coins
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
  const [isRefunding, setIsRefunding] = useState(false);

  const handleTriggerApproveRefund = async () => {
    if (!onApproveRefund || isRefunding) return;
    setIsRefunding(true);
    try {
      await onApproveRefund(order.id);
    } finally {
      setIsRefunding(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Status badge style helper
  const getBadgeColor = (status: OrderStatus) => {
    switch (status) {
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
    }
  };

  // In hóa đơn
  const handlePrintOrder = () => {
    window.print();
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

      case OrderStatus.REFUNDED: {
        const itemsToRefund = (order.returnedItems && order.returnedItems.length > 0) ? order.returnedItems : order.items;
        const refundAmount = order.returnRefundAmount || order.total;
        const returnReasonText = order.returnReason || "Lỗi sản phẩm / Không đúng kích cỡ / Khác";
        const returnImagesList = (order.returnImages && order.returnImages.length > 0) ? order.returnImages : [];

        return (
          <div className="space-y-4 text-left">
            <div className="text-xs text-rose-800 font-semibold bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">Yêu cầu trả hàng & hoàn tiền đang chờ Admin phê duyệt</span>
              </div>
              <span className="font-mono text-sm font-bold text-rose-700">{formatVND(refundAmount)}</span>
            </div>

            {/* Thông tin hoàn tiền nhanh trong khối thao tác */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
              <div className="text-xs">
                <span className="text-zinc-500 font-bold uppercase text-[10px]">Lý do hoàn trả: </span>
                <span className="text-zinc-900 font-bold">{returnReasonText}</span>
              </div>
              
              {order.returnDescription && (
                <div className="text-xs">
                  <span className="text-zinc-500 font-bold uppercase text-[10px]">Ghi chú khách: </span>
                  <span className="text-zinc-700 italic">"{order.returnDescription}"</span>
                </div>
              )}

              {/* Danh sách sản phẩm hoàn trả */}
              <div>
                <span className="text-zinc-500 font-bold uppercase text-[10px] block mb-1.5">
                  Sản phẩm khách chọn hoàn trả ({itemsToRefund.length}):
                </span>
                <div className="space-y-1.5">
                  {itemsToRefund.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-zinc-200 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img 
                          src={it.imageUrl} 
                          alt={it.name} 
                          className="w-8 h-10 object-cover rounded bg-zinc-100 shrink-0 border border-zinc-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200";
                          }}
                        />
                        <div className="truncate">
                          <p className="font-bold text-zinc-900 truncate">{it.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {it.size ? `Size ${it.size}` : ''} {it.color ? `• ${it.color}` : ''} • SL: <span className="font-bold text-rose-600">{it.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-zinc-800 text-xs shrink-0">{formatVND(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ảnh đính kèm nếu có */}
              {returnImagesList.length > 0 && (
                <div>
                  <span className="text-zinc-500 font-bold uppercase text-[10px] block mb-1.5">Ảnh bằng chứng đính kèm:</span>
                  <div className="flex flex-wrap gap-2">
                    {returnImagesList.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-300 hover:opacity-80 transition-opacity">
                        <img src={url} alt="Bằng chứng trả hàng" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {onApproveRefund && (
              <button
                onClick={handleTriggerApproveRefund}
                disabled={isRefunding}
                className="w-full font-sans text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-md border border-transparent flex items-center justify-center gap-2"
              >
                <Coins className="h-4 w-4" />
                {isRefunding ? "Đang xử lý hoàn tiền..." : `Duyệt hoàn trả & Hoàn ${formatVND(refundAmount)} vào Ví`}
              </button>
            )}
          </div>
        );
      }

      case OrderStatus.REFUND_COMPLETED:
        return (
          <div className="space-y-4 text-left">
            <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Đã hoàn tiền vào ví khách hàng thành công ({formatVND(order.returnRefundAmount || Math.max(0, order.total - order.shippingFee))}). Đơn hàng đã đóng.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isReturnFlow = order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED || order.isReturnRequested || (order.returnedItems && order.returnedItems.length > 0) || Boolean(order.returnReason);
  const itemsToRefund = (order.returnedItems && order.returnedItems.length > 0) ? order.returnedItems : order.items;
  const maxRefundAllowed = Math.max(0, order.total - order.shippingFee);
  const refundAmount = order.returnRefundAmount !== undefined && order.returnRefundAmount !== null
    ? Math.min(order.returnRefundAmount, maxRefundAllowed)
    : maxRefundAllowed;
  const returnReasonText = order.returnReason || "Lỗi sản phẩm / Không đúng mô tả";
  const returnImagesList = (order.returnImages && order.returnImages.length > 0) ? order.returnImages : [];

  return (
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
            onClick={handlePrintOrder}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all shadow-sm"
          >
            <Printer className="h-4 w-4 text-zinc-500" />
            In hóa đơn biên lai
          </button>
        </div>
      </div>

      {/* Simulated invoice modal pop */}
      {showInvoicePrintAlert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-8 rounded-2xl border border-zinc-150 shadow-2xl text-center space-y-4 max-w-xs ring-1 ring-black/5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce border border-emerald-100">
              <Printer className="h-6 w-6" />
            </div>
            <h4 className="font-sans text-lg font-bold text-zinc-900">Đang khởi tạo máy in...</h4>
            <p className="font-sans text-xs text-zinc-500 leading-relaxed font-medium">
              Dữ liệu của vận đơn #{order.id} đang được kết dịch sang định dạng văn bản hóa đơn đóng dấu đỏ Trendify.
            </p>
          </div>
        </div>
      )}

      {/* BANNER CẢNH BÁO YÊU CẦU HOÀN TRẢ Ở ĐẦU TRANG */}
      {isReturnFlow && (
        <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-md overflow-hidden text-left">
          {/* Header Banner */}
          <div className="p-5 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-rose-950 flex items-center gap-2">
                  <span>Yêu cầu Trả hàng & Hoàn tiền</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    order.status === OrderStatus.REFUND_COMPLETED 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}>
                    {order.status === OrderStatus.REFUND_COMPLETED ? "Đã duyệt hoàn tiền" : "Chờ Admin phê duyệt"}
                  </span>
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Khách hàng <span className="font-bold text-zinc-900">{order.customerName}</span> ({order.phone}) yêu cầu hoàn trả đơn hàng này.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Tổng tiền hoàn trả:</span>
              <span className="font-mono text-lg font-bold text-rose-600">{formatVND(refundAmount)}</span>
              <span className="text-[9px] text-zinc-400 block font-medium mt-0.5">(Đã trừ voucher, không hoàn phí ship)</span>
            </div>
          </div>

          <div className="p-6 space-y-5 bg-rose-50/20">
            {/* Lý do & Mô tả */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Lý do hoàn trả:</span>
                <p className="font-sans text-sm font-bold text-zinc-900 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {returnReasonText}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Mô tả / Lời nhắn từ khách:</span>
                <p className="font-sans text-xs text-zinc-700 mt-1 leading-relaxed italic">
                  "{order.returnDescription || "Khách hàng không nhập mô tả thêm."}"
                </p>
              </div>
            </div>

            {/* Danh sách các sản phẩm được chọn hoàn trả */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-3">
                Danh sách sản phẩm hoàn trả ({itemsToRefund.length} sản phẩm):
              </span>
              <div className="divide-y divide-zinc-100 border border-zinc-150 rounded-xl overflow-hidden">
                {itemsToRefund.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded-lg border border-zinc-200 shrink-0 bg-zinc-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200";
                        }}
                      />
                      <div>
                        <p className="font-sans text-xs font-bold text-zinc-900">{item.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.size && (
                            <span className="text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-medium">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-medium">
                              Màu: {item.color}
                            </span>
                          )}
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">
                            SL hoàn trả: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-zinc-900">{formatVND(item.price)}</p>
                      <p className="font-mono text-xs text-rose-600 font-bold mt-0.5">
                        Tạm tính: {formatVND(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hình ảnh bằng chứng đính kèm */}
            {returnImagesList.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-3">
                  Hình ảnh bằng chứng khách gửi kèm ({returnImagesList.length} ảnh):
                </span>
                <div className="flex flex-wrap gap-3">
                  {returnImagesList.map((imgUrl, idx) => (
                    <a 
                      key={idx} 
                      href={imgUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-24 h-24 rounded-xl overflow-hidden border-2 border-zinc-200 bg-zinc-100 hover:border-rose-400 hover:opacity-90 transition-all block shrink-0 shadow-xs group relative"
                      title="Bấm để mở ảnh gốc kích thước lớn"
                    >
                      <img 
                        src={imgUrl} 
                        alt="Hình ảnh bằng chứng trả hàng" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        Phóng to
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Nút hành động phê duyệt hoàn trả trực tiếp */}
            {order.status !== OrderStatus.REFUND_COMPLETED && onApproveRefund && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleTriggerApproveRefund}
                  disabled={isRefunding}
                  className="font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Coins className="h-4 w-4" />
                  {isRefunding ? "Đang thực hiện hoàn tiền..." : `Duyệt hoàn trả ngay & Cộng ${formatVND(refundAmount)} vào Ví khách hàng`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Cột trái: Danh sách sản phẩm & Tổng tiền */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            
            {/* Header chi tiết đơn hàng */}
            <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-mono text-xs tracking-wider text-zinc-500 uppercase font-bold">
                    Mã đơn hàng
                  </span>
                </div>
                <h3 className="font-sans text-xl text-zinc-950 font-bold mt-1">
                  #{order.id}
                </h3>
                <span className="font-sans text-xs text-zinc-500 mt-1 block">
                  Thời gian đặt: {order.date} • {order.time}
                </span>
              </div>

              {/* Trạng thái đơn hàng */}
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
                  ? "bg-teal-50 text-teal-700 border-teal-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}>
                {order.status}
              </span>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="p-6 divide-y divide-zinc-100">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider pb-3">
                Danh sách sản phẩm đã đặt ({order.items.length})
              </p>

              {order.items.map((item, idx) => {
                return (
                  <div key={idx} className="py-4 flex items-start gap-4 hover:bg-zinc-50/50 transition-colors rounded-xl px-2">
                    {/* Ảnh sản phẩm */}
                    <div className="w-16 h-20 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200 shrink-0 shadow-xs">
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

                    {/* Tên & Phân loại */}
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-sans text-sm text-zinc-900 font-bold tracking-tight">
                        {item.name}
                      </h4>
                      <p className="font-mono text-[10px] text-zinc-400 mt-0.5 uppercase">
                        SKU: {item.sku}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.size && (
                          <span className="font-sans text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">
                            Kích cỡ: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="font-sans text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">
                            Màu sắc: {item.color}
                          </span>
                        )}
                        <span className="font-sans text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">
                          Số lượng: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Đơn giá & Tạm tính */}
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-zinc-950">
                        {formatVND(item.price)}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">
                        Tạm tính: {formatVND(item.price * item.quantity)}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bảng tính tổng tiền */}
            <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-medium">Giá đơn hàng (Tạm tính):</span>
                <span className="text-xs font-mono font-bold text-zinc-900">{formatVND(order.subtotal)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-medium">Phí vận chuyển:</span>
                <span className="text-xs font-mono text-zinc-700 font-bold">+{formatVND(order.shippingFee)}</span>
              </div>

              {/* Giảm giá voucher */}
              {(order.discountAmount && order.discountAmount > 0) ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                    <span>Mã giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ""}:</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">-{formatVND(order.discountAmount)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium">Mã giảm giá:</span>
                  <span className="text-xs font-mono">0 ₫</span>
                </div>
              )}
              
              <div className="h-[1px] bg-zinc-200/60 my-2" />

              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-bold text-zinc-950">Tổng tiền thanh toán:</span>
                <span className="font-mono text-lg font-bold text-blue-700">{formatVND(order.total)}</span>
              </div>
            </div>

          </div>

          {/* Khối Cập nhật trạng thái đơn hàng */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h4 className="font-sans text-base text-zinc-900 font-bold">
              Cập nhật trạng thái đơn hàng
            </h4>
            <p className="font-sans text-xs text-zinc-500 leading-relaxed">
              Chọn bước xử lý tiếp theo để đồng bộ trạng thái đơn hàng và thông báo đến khách hàng.
            </p>

            <div className="pt-2">
              {renderWorkflowActions()}
            </div>
          </div>

        </div>

        {/* Cột phải: Thông tin Người đặt & Người nhận */}
        <div className="space-y-6">
          
          {/* 1. Thông tin Người đặt hàng (Tài khoản mua hàng) */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <UserCheck className="h-4.5 w-4.5 text-blue-600" />
              <h4 className="font-sans text-sm text-zinc-950 font-bold">
                1. Người đặt hàng (Tài khoản)
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 ring-2 ring-zinc-200 shrink-0">
                <img 
                  src={order.customerAvatar} 
                  alt={order.ordererName || order.customerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-zinc-900 truncate">
                  {order.ordererName || order.customerName || "Khách hàng"}
                </p>
                <span className="text-[11px] text-zinc-500 block truncate">
                  {order.ordererEmail || order.email || "Chưa có email"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 text-xs space-y-2 text-zinc-600">
              <div className="flex justify-between">
                <span className="text-zinc-500">Mã tài khoản:</span>
                <span className="font-mono text-zinc-800 text-[11px] truncate max-w-[150px]">{order.userId || "Khách vãng lai"}</span>
              </div>
              {order.ordererPhone && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">SĐT tài khoản:</span>
                  <span className="font-mono font-bold text-zinc-800">{order.ordererPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Thông tin Người nhận & Địa chỉ giao hàng */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <MapPin className="h-4.5 w-4.5 text-emerald-600" />
              <h4 className="font-sans text-sm text-zinc-950 font-bold">
                2. Người nhận hàng &amp; Giao hàng
              </h4>
            </div>

            <div className="space-y-3 text-xs text-left">
              <div>
                <p className="text-zinc-400 font-bold text-[10px] uppercase">Tên người nhận:</p>
                <p className="font-bold text-zinc-900 text-sm mt-0.5">
                  {order.recipientName || order.customerName || "Khách nhận"}
                </p>
              </div>

              <div>
                <p className="text-zinc-400 font-bold text-[10px] uppercase">Số điện thoại nhận hàng:</p>
                <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                  {order.recipientPhone || order.phone || "Chưa có SĐT"}
                </p>
              </div>

              <div>
                <p className="text-zinc-400 font-bold text-[10px] uppercase">Địa chỉ nhận hàng:</p>
                <p className="text-zinc-700 leading-relaxed mt-0.5 font-medium bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  {order.recipientAddress || order.address || "Tại cửa hàng"}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Phương thức thanh toán */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-3 text-left">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
              <h4 className="font-sans text-sm text-zinc-950 font-bold">
                3. Phương thức thanh toán
              </h4>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Hình thức:</span>
                <span className="font-bold text-zinc-900">{order.paymentMethod || "COD (Thanh toán khi nhận hàng)"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Tổng tiền:</span>
                <span className="font-mono font-bold text-zinc-900">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          {/* 4. Tiến trình giao hàng */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Truck className="h-4.5 w-4.5 text-blue-600" />
              <h4 className="font-sans text-sm text-zinc-950 font-bold">
                4. Tiến trình giao hàng
              </h4>
            </div>

            <div className="space-y-6 pt-2">
              
              {/* Stage 1: Khởi tạo đơn hàng */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-xs ${
                    order.status === OrderStatus.CANCELLED
                      ? 'bg-rose-500'
                      : order.status !== OrderStatus.AWAITING_PAYMENT
                      ? 'bg-blue-600'
                      : 'bg-amber-500'
                  }`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className={`w-[2px] h-8 ${
                    order.status !== OrderStatus.AWAITING_PAYMENT && order.status !== OrderStatus.CANCELLED ? 'bg-blue-600' : 'bg-zinc-200'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Khởi tạo đơn hàng</p>
                  <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                    {order.status === OrderStatus.CANCELLED
                      ? "Đã hủy đơn"
                      : "Đã tạo đơn hàng thành công"}
                  </p>
                </div>
              </div>

              {/* Stage 2: Đang xử lý */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-xs ${
                    order.status === OrderStatus.CANCELLED
                      ? 'bg-zinc-200 text-zinc-400'
                      : order.status !== OrderStatus.AWAITING_PAYMENT
                      ? 'bg-blue-600'
                      : 'bg-zinc-200 text-zinc-400'
                  }`}>
                    <Package className={`h-3.5 w-3.5 ${
                      order.status !== OrderStatus.AWAITING_PAYMENT && order.status !== OrderStatus.CANCELLED ? 'text-white' : 'text-zinc-400'
                    }`} />
                  </div>
                  <div className={`w-[2px] h-8 ${
                    order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED ? 'bg-blue-600' : 'bg-zinc-200'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Đang xử lý</p>
                  <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                    {order.status === OrderStatus.CANCELLED
                      ? "Đã hủy"
                      : order.status !== OrderStatus.AWAITING_PAYMENT
                      ? "Đã xác nhận & đang đóng gói"
                      : "Chờ xác nhận"}
                  </p>
                </div>
              </div>

              {/* Stage 3: Đang giao hàng */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-xs ${
                    order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED
                      ? 'bg-blue-600'
                      : 'bg-zinc-200 text-zinc-400'
                  }`}>
                    <Truck className={`h-3.5 w-3.5 ${
                      order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED ? 'text-white' : 'text-zinc-400'
                    }`} />
                  </div>
                  <div className={`w-[2px] h-8 ${
                    order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED ? 'bg-blue-600' : 'bg-zinc-200'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Đang giao hàng</p>
                  <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                    {order.status === OrderStatus.SHIPPING || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED
                      ? "Đã bàn giao cho đơn vị vận chuyển"
                      : "Chờ giao cho ĐVVC"}
                  </p>
                </div>
              </div>

              {/* Stage 4: Giao hàng thành công (LUÔN HIỂN THỊ) */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-xs ${
                    order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED
                      ? 'bg-emerald-600'
                      : 'bg-zinc-200 text-zinc-400'
                  }`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${
                      order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED ? 'text-white' : 'text-zinc-400'
                    }`} />
                  </div>
                  
                  {/* Đường nối xuống bước trả hàng nếu có yêu cầu trả hàng */}
                  {(order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED) && (
                    <div className="w-[2px] h-8 bg-rose-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Giao hàng thành công</p>
                  <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                    {order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED
                      ? "Khách đã nhận hàng"
                      : "Chờ người mua nhận hàng"}
                  </p>
                </div>
              </div>

              {/* Stage 5: Yêu cầu Trả hàng / Hoàn tiền (Chỉ hiện khi có yêu cầu trả hàng) */}
              {(order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED) && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-xs bg-rose-500">
                      <AlertOctagon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className={`w-[2px] h-8 ${
                      order.status === OrderStatus.REFUND_COMPLETED ? 'bg-emerald-600' : 'bg-zinc-200'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-700">Yêu cầu trả hàng &amp; hoàn tiền</p>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      Khách hàng gửi yêu cầu hoàn trả
                    </p>
                  </div>
                </div>
              )}

              {/* Stage 6: Duyệt hoàn tiền vào ví (Chỉ hiện khi có yêu cầu trả hàng) */}
              {(order.status === OrderStatus.REFUNDED || order.status === OrderStatus.REFUND_COMPLETED) && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-xs ${
                      order.status === OrderStatus.REFUND_COMPLETED
                        ? 'bg-emerald-600'
                        : 'bg-zinc-200 text-zinc-400'
                    }`}>
                      <Coins className={`h-3.5 w-3.5 ${
                        order.status === OrderStatus.REFUND_COMPLETED ? 'text-white' : 'text-zinc-400'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Hoàn tiền vào ví</p>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      {order.status === OrderStatus.REFUND_COMPLETED
                        ? "Đã hoàn tiền vào ví thành công"
                        : "Chờ Admin phê duyệt"}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
