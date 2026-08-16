/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Plus, 
  FolderGit2, 
  Trash2, 
  Edit2, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Category } from "../types";

interface CategoryListViewProps {
  categories: Category[];
  onAddCategoryClick: () => void;
  onEditCategoryClick: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleLive: (categoryId: string) => void;
}

export const CategoryListView: React.FC<CategoryListViewProps> = ({
  categories,
  onAddCategoryClick,
  onEditCategoryClick,
  onDeleteCategory,
  onToggleLive
}) => {
  const [filterStatus, setFilterStatus] = React.useState<string>("All");

  const filteredCategories = categories.filter(cat => {
    if (filterStatus === "live") return cat.isLive;
    if (filterStatus === "draft") return !cat.isLive;
    return true;
  });

  const handleDeleteCheck = (id: string, name: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`);
    if (isConfirmed) {
      onDeleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Header bar & controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Quản lý danh mục</h2>
        </div>

        <button
          onClick={onAddCategoryClick}
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        <div className="flex bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterStatus("All")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
              filterStatus === "All" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Tất cả ({categories.length})
          </button>
          <button
            onClick={() => setFilterStatus("live")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
              filterStatus === "live" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Đang hiển thị ({categories.filter(c => c.isLive).length})
          </button>
          <button
            onClick={() => setFilterStatus("draft")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
              filterStatus === "draft" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Đang ẩn ({categories.filter(c => !c.isLive).length})
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderGit2 className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-700">Chưa có danh mục nào</p>
            <p className="text-xs text-zinc-500 mt-1">Bấm nút "Thêm danh mục mới" ở trên để tạo danh mục đầu tiên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4 text-center">Số lượng sản phẩm</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4">Cập nhật lần cuối</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCategories.map((category) => {
                  return (
                    <tr key={category.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Thumbnail & Name */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-8 h-8 rounded-md object-cover border border-zinc-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600";
                            }}
                          />
                          <div>
                            <p className="font-semibold text-zinc-900 text-xs">{category.name}</p>
                            <span className="font-mono text-[10px] text-zinc-400">/{category.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Product Count */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-full">
                          {category.productCount} sản phẩm
                        </span>
                      </td>


                      {/* Live Status Toggle */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => onToggleLive(category.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            category.isLive 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${category.isLive ? 'bg-emerald-600' : 'bg-zinc-400'}`} />
                          {category.isLive ? "Đang hiển thị" : "Đã ẩn"}
                        </button>
                      </td>

                      {/* Last updated */}
                      <td className="py-2.5 px-4 text-xs text-zinc-500">
                        {category.lastUpdated || "Mới đây"}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditCategoryClick(category)}
                            className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                            title="Sửa danh mục"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCheck(category.id, category.name)}
                            className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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

