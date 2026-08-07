import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Image, AlertCircle, Sparkles } from "lucide-react";

export const BannersView: React.FC = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchActiveBanner = async () => {
      try {
        const docRef = doc(db, "banners", "active");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setImageUrl(data.imageUrl || "");
          setIsActive(data.isActive || false);
        }
      } catch (e) {
        console.error("Error fetching active banner:", e);
      }
    };

    fetchActiveBanner();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập đường dẫn hình ảnh!" });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      await setDoc(doc(db, "banners", "active"), {
        imageUrl: imageUrl.trim(),
        isActive: isActive,
        updatedAt: new Date(),
      });
      setStatusMessage({ type: "success", text: "Cập nhật Banner quảng cáo thành công!" });
    } catch (e: any) {
      console.error("Error saving banner:", e);
      setStatusMessage({ type: "error", text: "Lỗi cập nhật: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-zinc-900 tracking-tight font-medium">Banner Quảng Cáo Popup</h2>
          <p className="text-zinc-500 text-xs mt-1">Cấu hình hình ảnh quảng cáo xuất hiện ở giữa màn hình điện thoại khi khách hàng mở ứng dụng</p>
        </div>
        <div className="p-3 bg-zinc-100 rounded-xl">
          <Image className="h-6 w-6 text-zinc-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Settings */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-[#8c7623]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Thiết lập Banner</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                Đường dẫn hình ảnh Banner (Image URL) *
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner-fashion.jpg"
                className="w-full text-xs p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                required
              />
            </div>

            {/* Toggle IsActive */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-150">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Trạng thái kích hoạt</h4>
                <p className="text-[10px] text-zinc-450 mt-0.5">Bật/tắt quảng cáo hiển thị khi vào app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
              </label>
            </div>

            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-850 text-white p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Lưu cấu hình</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Xem trước giao diện</h3>
          
          <div className="border border-zinc-200 rounded-3xl p-4 bg-zinc-900/5 flex justify-center items-center aspect-[9/16] relative shadow-inner">
            {/* Phone Mockup Frame */}
            <div className="w-full h-full max-w-[260px] bg-white rounded-[32px] border-8 border-zinc-800 relative shadow-2xl overflow-hidden flex flex-col justify-center items-center">
              {/* Ad Banner Popup Mockup */}
              {isActive && imageUrl ? (
                <div className="absolute inset-0 bg-black/40 flex justify-center items-center p-6 z-10">
                  <div className="bg-white rounded-2xl w-full aspect-[4/5] relative overflow-hidden shadow-2xl">
                    <img
                      src={imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).src = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    {/* Close Button Mockup */}
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-black shadow">
                      ✕
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <AlertCircle className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Banner tắt</p>
                  <p className="text-[9px] text-zinc-400 mt-1">Không hiển thị quảng cáo</p>
                </div>
              )}
              {/* Home screen mock background */}
              <div className="w-full h-full bg-zinc-50/50 p-3 flex flex-col justify-between opacity-30 select-none pointer-events-none">
                <div className="h-4 bg-zinc-200 rounded-md w-1/3" />
                <div className="h-32 bg-zinc-150 rounded-xl my-4" />
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="bg-zinc-150 rounded-lg" />
                  <div className="bg-zinc-150 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
