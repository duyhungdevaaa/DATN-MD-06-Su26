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
  searchText: string;
}

export const UserListView: React.FC<UserListViewProps> = ({
  users,
  onUpdateUserTier,
  searchText
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filters logic
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.id.toLowerCase().includes(searchText.toLowerCase())
    );
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div>
          <h3 className="font-serif text-lg text-zinc-900 font-bold">Bản ghi danh hội viên</h3>
          <p className="font-sans text-xs text-zinc-400 mt-1">
            Theo dõi, định hạng và tri ân đặc quyền cho cơ sở dữ liệu khách hàng Haute Couture Việt Nam.
          </p>
        </div>


      </div>

      {/* Main clients grid or empty box */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-16 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4">
            <Users className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="font-serif text-lg text-zinc-800 font-medium">Không tìm thấy hội viên phù hợp</h3>
          <p className="font-sans text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Đặt thử bộ tìm kiếm hoặc điều chỉnh hạng thẻ để quét tìm kiếm một lần nữa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.map((user) => {
            return (
              <div 
                key={user.id}
                className="bg-white rounded-2xl border border-zinc-200/50 p-6 shadow-sm flex items-start gap-4 hover:border-[#8c7623]/40 hover:shadow-md transition-all duration-350"
              >
                {/* Client Avatar portrayal */}
                <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-zinc-100 bg-zinc-50 shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200";
                    }}
                  />
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base text-zinc-900 font-bold truncate">
                      {user.name}
                    </h4>

                  </div>

                  <span className="font-mono text-[9px] text-zinc-400 block mt-0.5 uppercase tracking-widest">
                    ID: {user.id}
                  </span>

                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="text-xs font-sans truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="text-xs font-sans">Ngày gia nhập: {user.joinedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100">
                    <span className="font-sans text-[10px] text-[#8c7623] font-bold uppercase tracking-wider">
                      Cực kỳ tích cực
                    </span>
                    <button
                      onClick={() => handleOpenStats(user)}
                      className="px-3.5 py-1.5 bg-zinc-50 hover:bg-[#8c7623]/10 text-zinc-650 hover:text-[#8c7623] hover:border-[#8c7623]/30 text-[10px] font-bold uppercase tracking-wider border border-zinc-200 rounded-lg font-sans transition-all duration-200"
                    >
                      Xem chi tiết
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl relative overflow-y-auto ring-1 ring-black/5 rounded-l-3xl">
            
            {/* Close Trigger Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors border border-zinc-200/50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-8">
              {/* Profile card summary */}
              <div className="text-center pt-4">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#8c7623]/10 bg-zinc-50 mx-auto">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-zinc-950 mt-4">
                  {selectedUser.name}
                </h3>
                <p className="font-mono text-[9px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">
                  ID: {selectedUser.id}
                </p>
                

              </div>

              {/* Statistical details simulation */}
              <div className="bg-zinc-50/50 p-4.5 rounded-2xl border border-zinc-150/70 divide-y divide-zinc-200/50">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-sans text-zinc-500 font-semibold">Doanh số trọn đời (LTV):</span>
                  <span className="text-xs font-mono font-bold text-zinc-900">45.000.000 ₫</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-sans text-zinc-500 font-semibold">Số đơn hoàn thành:</span>
                  <span className="text-xs font-mono font-bold text-zinc-950">3 Đơn hàng</span>
                </div>
              </div>
            </div>

            {/* Close footer button */}
            <div className="pt-6 border-t border-zinc-100 mt-8">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-3.5 bg-zinc-900 text-white text-xs font-bold tracking-wider font-sans uppercase rounded-xl hover:bg-[#8c7623] hover:shadow-lg hover:shadow-zinc-900/5 transition-all duration-200"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
