import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Send, Trash2, Bell, Sparkles } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  createdAt: any;
}

export const NotificationsView: React.FC = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: NotificationItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || "",
          body: data.body || "",
          imageUrl: data.imageUrl || "",
          createdAt: data.createdAt,
        });
      });
      setNotifications(list);
    }, (error) => {
      console.error("Error loading notifications:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập đầy đủ tiêu đề và nội dung!" });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      await addDoc(collection(db, "notifications"), {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || null,
        createdAt: new Date(),
      });
      setTitle("");
      setBody("");
      setImageUrl("");
      setStatusMessage({ type: "success", text: "Gửi thông báo hệ thống thành công!" });
    } catch (e: any) {
      console.error("Error sending notification:", e);
      setStatusMessage({ type: "error", text: "Lỗi gửi thông báo: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        await deleteDoc(doc(db, "notifications", id));
        setStatusMessage({ type: "success", text: "Đã xóa thông báo thành công!" });
      } catch (e: any) {
        console.error("Error deleting notification:", e);
        setStatusMessage({ type: "error", text: "Lỗi xóa thông báo: " + e.message });
      }
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-zinc-900 tracking-tight font-medium">Thông báo hệ thống</h2>
          <p className="text-zinc-500 text-xs mt-1">Gửi thông báo đẩy và cập nhật tin tức đến ứng dụng di động khách hàng</p>
        </div>
        <div className="p-3 bg-zinc-100 rounded-xl">
          <Bell className="h-6 w-6 text-zinc-850" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-[#8c7623]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Tạo thông báo mới</h3>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                Tiêu đề thông báo *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                className="w-full text-xs p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                Nội dung chi tiết *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nhập nội dung thông báo đẩy..."
                rows={4}
                className="w-full text-xs p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                Đường dẫn hình ảnh (Không bắt buộc)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full text-xs p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
              />
              {imageUrl && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-zinc-200 aspect-[2/1] bg-zinc-50 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Live preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Xem trước ảnh
                  </span>
                </div>
              )}
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
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi thông báo</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Lịch sử thông báo đã gửi ({notifications.length})</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center text-zinc-450">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-xs font-medium">Chưa có thông báo nào được gửi.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white border border-zinc-200/60 rounded-2xl p-4 flex gap-4 items-start hover:border-zinc-300 transition-all shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-bold text-zinc-950 truncate">{notif.title}</h4>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-all"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">{notif.body}</p>
                    
                    {notif.imageUrl && (
                      <img
                        src={notif.imageUrl}
                        alt="Notification banner"
                        className="mt-3 max-h-32 rounded-lg object-cover border border-zinc-150"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}

                    <div className="text-[10px] text-zinc-400 mt-2.5 font-mono">
                      {notif.createdAt?.seconds 
                        ? new Date(notif.createdAt.seconds * 1000).toLocaleString("vi-VN")
                        : "Vừa xong"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
