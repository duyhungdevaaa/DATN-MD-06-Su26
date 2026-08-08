/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Award, 
  Mail, 
  Calendar,
  X,
  Check,
  UserCheck
} from "lucide-react";
import { User, UserTier } from "../types";

interface UserListViewProps {
  users: User[];
  onUpdateUserTier: (userId: string, newTier: UserTier) => void;
  onUpdateUserPhoneStatus?: (userId: string, verified: boolean) => void;
  searchText: string;
}

export const UserListView: React.FC<UserListViewProps> = ({
  users,
  onUpdateUserTier,
  onUpdateUserPhoneStatus,
  searchText
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("All");

  // Filters logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.id.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTier = tierFilter === "All" || user.tier === tierFilter;
    
    return matchesSearch && matchesTier;
  });

  const handleOpenStats = (user: User) => {
    setSelectedUser(user);
  };

  // Select membership colors
  const getTierBadgeStyle = (tier: UserTier) => {
    switch (tier) {
      case UserTier.GOLD:
        return "bg-amber-100 text-amber-800 border-amber-300";
      case UserTier.SILVER:
        return "bg-slate-100 text-slate-800 border-slate-300";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative text-left font-sans">
      
      {/* Search and control filter line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#cfc4c5]/30 custom-shadow">
        <div>
          <h3 className="font-sans text-lg text-neutral-900 font-bold">Bản ghi danh hội viên</h3>
          <p className="font-sans text-xs text-neutral-400 mt-1 font-medium">
            Theo dõi, định hạng và tri ân đặc quyền cho cơ sở dữ liệu khách hàng Haute Couture Việt Nam.
          </p>
        </div>

        {/* Tier filter dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest">Hạng thẻ:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#6c5e06] focus:outline-none focus:bg-white font-sans font-semibold text-neutral-700"
          >
            <option value="All">Tất cả thứ hạng</option>
            <option value={UserTier.GOLD}>Thành viên GOLD</option>
            <option value={UserTier.SILVER}>Thành viên SILVER</option>
            <option value={UserTier.GUEST}>Hạng chuẩn GUEST</option>
          </select>
        </div>
      </div>

      {/* Main clients grid or empty box */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#cfc4c5]/30 p-16 text-center custom-shadow">
          <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="font-sans text-lg text-neutral-800 font-bold">Không tìm thấy hội viên phù hợp</h3>
          <p className="font-sans text-xs text-neutral-500 mt-2 max-w-sm mx-auto font-medium">
            Đặt thử bộ tìm kiếm hoặc điều chỉnh hạng thẻ để quét tìm kiếm một lần nữa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.map((user) => {
            return (
              <div 
                key={user.id}
                className="bg-white rounded-xl border border-[#cfc4c5]/30 p-6 custom-shadow flex items-start gap-4 hover:border-[#6c5e06]/50 transition-all duration-300"
              >
                {/* Client Avatar portrayal */}
                <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-[#cfc4c5]/20 bg-neutral-100 shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                    }}
                  />
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans text-base text-[#1b1c1c] font-bold truncate">
                      {user.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border font-sans ${getTierBadgeStyle(user.tier)}`}>
                      {user.tier}
                    </span>
                    {user.phoneVerified !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider ${
                        user.phoneVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {user.phoneVerified ? "Đã xác nhận" : "Chưa xác nhận"}
                      </span>
                    )}
                  </div>

                  <span className="font-sans text-[9px] text-neutral-400 block mt-0.5 uppercase tracking-widest font-bold">
                    ID: {user.id}
                  </span>

                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Mail className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-xs font-sans font-medium truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-xs font-sans font-medium">Ngày gia nhập: {user.joinedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
                    <span className="font-sans text-[10px] text-[#6c5e06] font-bold uppercase tracking-wider">
                      Cực kỳ tích cực
                    </span>
                    <button
                      onClick={() => handleOpenStats(user)}
                      className="px-3.5 py-1.5 bg-neutral-50 hover:bg-[#6c5e06]/5 text-neutral-700 hover:text-[#6c5e06] text-[10px] font-semibold uppercase tracking-wider border border-neutral-200 rounded-lg font-sans transition-colors"
                    >
                      Bảng đặc quyền & Hạng thẻ
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Customer VIP privileges inspection overlay drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl relative overflow-y-auto font-sans">
            
            {/* Close Trigger Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="space-y-8">
              {/* Profile card summary */}
              <div className="text-center pt-4">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#6c5e06]/20 bg-neutral-100 mx-auto">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-sans text-xl font-bold text-neutral-900 mt-4">
                  {selectedUser.name}
                </h3>
                <p className="font-sans text-[9px] text-neutral-400 mt-1 uppercase tracking-widest font-bold">
                  ID: {selectedUser.id}
                </p>
                
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border inline-block mt-3 font-sans ${getTierBadgeStyle(selectedUser.tier)}`}>
                  Hạng Thẻ Hiện Tại: {selectedUser.tier}
                </span>
              </div>

              {/* Statistical details simulation */}
              <div className="bg-[#fbf9f9] p-4.5 rounded-xl border border-neutral-100 divide-y divide-neutral-150/40 font-sans">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs text-neutral-500 font-medium">Doanh số trọn đời (LTV):</span>
                  <span className="text-xs font-bold text-neutral-900">45.000.000 ₫</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-neutral-500 font-medium">Số đơn hoàn thành:</span>
                  <span className="text-xs font-bold text-neutral-900">3 Đơn hàng</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-neutral-500 font-medium">Voucher đề xuất:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">VIP_COU_15</span>
                </div>
              </div>

              {/* Phone Verification Toggle */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans border-b border-neutral-100 pb-2">
                  Trạng thái xác thực số điện thoại:
                </p>
                <button
                  onClick={() => {
                    if (onUpdateUserPhoneStatus) {
                      onUpdateUserPhoneStatus(selectedUser.id, !selectedUser.phoneVerified);
                      setSelectedUser({ ...selectedUser, phoneVerified: !selectedUser.phoneVerified });
                    }
                  }}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    selectedUser.phoneVerified
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedUser.phoneVerified ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {selectedUser.phoneVerified ? "Đã xác nhận SĐT" : "Chưa xác nhận SĐT"}
                      </p>
                      <p className="text-[10px] opacity-70 mt-0.5">
                        {selectedUser.phoneVerified ? "Người dùng này có thể đặt hàng ngay." : "Người dùng sẽ phải xác nhận lại SĐT khi đặt hàng."}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold underline uppercase">Thay đổi</span>
                </button>
              </div>

              {/* Interactive Tier Change control panel */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans border-b border-neutral-100 pb-2">
                  Thay đổi phân hạng ưu tiên hội viên:
                </p>

                <div className="space-y-2.5">
                  {Object.values(UserTier).map((tierOpt) => {
                    const isSelected = selectedUser.tier === tierOpt;
                    return (
                      <button
                        key={tierOpt}
                        onClick={() => {
                          onUpdateUserTier(selectedUser.id, tierOpt);
                          // Keep locally updated
                          setSelectedUser({ ...selectedUser, tier: tierOpt });
                        }}
                        className={`w-full p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#6c5e06]/10 border-[#6c5e06] text-[#6c5e06]"
                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-xs font-bold uppercase tracking-wider">{tierOpt}</span>
                            {tierOpt === UserTier.GOLD && (
                              <span className="text-[9px] font-sans font-bold text-amber-700">Giảm giá 15% VIP</span>
                            )}
                            {tierOpt === UserTier.SILVER && (
                              <span className="text-[9px] font-sans font-bold text-slate-700">Giảm giá 5% VIP</span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 font-sans mt-0.5 leading-normal font-medium">
                            {tierOpt === UserTier.GOLD 
                              ? "Yêu cầu chi tiêu tối thiểu 30 triệu đồng hàng năm." 
                              : tierOpt === UserTier.SILVER 
                              ? "Yêu cầu chi tiêu tối thiểu 10 triệu đồng hàng năm." 
                              : "Thẻ thành viên tiêu chuẩn thông dụng."}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#6c5e06] flex items-center justify-center text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Close footer button */}
            <div className="pt-6 border-t border-neutral-100 mt-8">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-3 bg-[#1b1c1c] text-white text-xs font-semibold tracking-wider font-sans uppercase rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Xác nhận thay đổi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
