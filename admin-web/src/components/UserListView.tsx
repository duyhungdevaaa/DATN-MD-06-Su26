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
  Phone,
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
  const [tierFilter, setTierFilter] = useState<string>("All");

  // Filters logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.phone && user.phone.includes(searchText)) ||
      user.id.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTier = tierFilter === "All" || user.tier === tierFilter;
    
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Quản lý khách hàng ({users.length})</h2>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-700">Không tìm thấy khách hàng phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Số điện thoại</th>
                  <th className="py-3.5 px-4">Ngày gia nhập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                            }}
                          />
                          <div>
                            <p className="font-semibold text-zinc-900 text-xs">{user.name}</p>
                            <span className="font-mono text-[10px] text-zinc-400">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-2.5 px-4 text-xs text-zinc-600 font-sans">
                        {user.email || "Chưa cập nhật"}
                      </td>

                      {/* Phone */}
                      <td className="py-2.5 px-4 text-xs font-mono font-semibold text-zinc-700">
                        {user.phone && user.phone.trim() ? (
                          user.phone.trim()
                        ) : (
                          <span className="text-zinc-400 italic font-normal">Chưa cập nhật SĐT</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-2.5 px-4 text-xs text-zinc-500 font-sans">
                        {user.joinedDate || "Mới gia nhập"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

