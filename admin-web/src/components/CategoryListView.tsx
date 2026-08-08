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

  const handleDeleteCheck = (id: string, name: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc muốn xóa phân danh mục "${name}"? Hành động này có thể dịch chuyển các sản phẩm liên đới sang phân loại chung.`);
    if (isConfirmed) {
      onDeleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Search and control filter line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div>
<<<<<<< HEAD
          <h3 className="font-sans text-lg text-neutral-900 font-bold">Bản phân loại Bộ sưu tập</h3>
          <p className="font-sans text-xs text-neutral-400 mt-1 font-medium">
=======
          <h3 className="font-serif text-lg text-zinc-900 font-bold">Bản phân loại Bộ sưu tập</h3>
          <p className="font-sans text-xs text-zinc-400 mt-1">
>>>>>>> origin/main
            Giao diện cấu hình danh mục cha, định tuyến khách hàng, và kiểm dịch hiển thị thị trường trực tuyến.
          </p>
        </div>

        {/* Category Add Button */}
        <button
          onClick={onAddCategoryClick}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white hover:bg-[#8c7623] px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase font-sans transition-all duration-200 shadow-md shadow-zinc-900/5 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Bổ sung danh mục mới
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-16 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4">
            <FolderGit2 className="h-5 w-5 text-zinc-400" />
          </div>
<<<<<<< HEAD
          <h3 className="font-sans text-lg text-neutral-800 font-bold">Chưa có danh mục nào được lưu</h3>
          <p className="font-sans text-xs text-neutral-500 mt-2 max-w-sm mx-auto font-medium">
=======
          <h3 className="font-serif text-lg text-zinc-800 font-medium">Chưa có danh mục nào được lưu</h3>
          <p className="font-sans text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
>>>>>>> origin/main
            Vui lòng nhấn nút góc bên phải để thêm phân nhóm danh mục cha đầu tiên của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            return (
              <div 
                key={category.id}
                className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-[#8c7623]/40 hover:shadow-md transition-all duration-350"
              >
                {/* Visual Cover Frame */}
                <div className="relative aspect-[4/3] bg-zinc-50 overflow-hidden border-b border-zinc-100">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover editorial-img group-hover:scale-102"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600";
                    }}
                  />
                  {/* Item counter count */}
<<<<<<< HEAD
                  <span className="absolute top-3 left-3 bg-[#1b1c1c] text-white text-[9px] font-sans font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
=======
                  <span className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-sm text-white text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
>>>>>>> origin/main
                    {category.productCount} SẢN PHẨM
                  </span>

                  {/* Slug label overlay */}
<<<<<<< HEAD
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm shadow-sm text-neutral-700 px-2 py-0.5 rounded text-[8px] font-sans font-bold tracking-widest uppercase">
=======
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm shadow-sm text-zinc-700 px-2 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase">
>>>>>>> origin/main
                    /{category.slug}
                  </span>
                </div>

                {/* Body Meta Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 font-sans">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
<<<<<<< HEAD
                      <h4 className="font-sans text-base text-neutral-900 font-bold tracking-tight">
=======
                      <h4 className="font-serif text-base text-zinc-900 font-bold tracking-tight">
>>>>>>> origin/main
                        {category.name}
                      </h4>
                      {/* Active Status Toggle */}
                      <button
                        onClick={() => onToggleLive(category.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold font-sans tracking-wide border transition-all ${
                          category.isLive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-zinc-100" 
                            : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-emerald-50"
                        }`}
                        title="Click để đổi trạng thái"
                      >
<<<<<<< HEAD
                        <span className={`w-1.5 h-1.5 rounded-full ${category.isLive ? 'bg-green-600' : 'bg-neutral-400'}`} />
=======
                        <span className={`w-1.5 h-1.5 rounded-full ${category.isLive ? 'bg-emerald-600 animate-pulse' : 'bg-zinc-400'}`} />
>>>>>>> origin/main
                        {category.isLive ? "LIVE" : "DRAFT"}
                      </button>
                    </div>

<<<<<<< HEAD
                    <p className="font-sans text-[11px] text-neutral-400 min-h-[32px] line-clamp-2 leading-relaxed font-medium">
=======
                    <p className="font-sans text-xs text-zinc-400 min-h-[32px] line-clamp-2 leading-relaxed">
>>>>>>> origin/main
                      {category.description || "Chưa thiết lập ghi chú chi tiết cho nhóm này."}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <div className="flex flex-col text-left space-y-0.5">
<<<<<<< HEAD
                      <span className="text-[9px] font-sans font-bold text-neutral-400 uppercase tracking-widest leading-none">Chỉnh lý bởi:</span>
                      <strong className="text-[10px] text-neutral-700 font-sans tracking-tight font-medium">
=======
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-none font-bold">Chỉnh lý bởi:</span>
                      <strong className="text-[10px] text-zinc-650 font-sans tracking-tight">
>>>>>>> origin/main
                        {category.updatedBy} ({category.lastUpdated})
                      </strong>
                    </div>

                    {/* Operational Actions Card */}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => onEditCategoryClick(category)}
<<<<<<< HEAD
                        className="p-1 px-2.5 bg-neutral-150 hover:bg-[#6c5e06]/10 text-neutral-600 hover:text-[#6c5e06] text-[10px] uppercase font-semibold tracking-wider font-sans rounded border border-neutral-200 transition-colors duration-200 flex items-center gap-1"
=======
                        className="p-1 px-2.5 bg-zinc-50 hover:bg-[#8c7623]/10 text-zinc-650 hover:text-[#8c7623] text-[10px] uppercase font-bold tracking-wider font-sans rounded-lg border border-zinc-200/80 transition-colors duration-200 flex items-center gap-1"
>>>>>>> origin/main
                        title="Điều chỉnh nhóm"
                      >
                        <Edit2 className="h-3 w-3" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCheck(category.id, category.name)}
<<<<<<< HEAD
                        className="p-1 px-2.5 bg-neutral-100 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 text-[10px] uppercase font-semibold tracking-wider font-sans rounded border border-neutral-200 transition-colors duration-200 flex items-center gap-1"
=======
                        className="p-1 px-2.5 bg-zinc-50 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 text-[10px] uppercase font-bold tracking-wider font-sans rounded-lg border border-zinc-200/80 transition-colors duration-200 flex items-center gap-1"
>>>>>>> origin/main
                        title="Gỡ bỏ hoàn toàn"
                      >
                        <Trash2 className="h-3 w-3" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
