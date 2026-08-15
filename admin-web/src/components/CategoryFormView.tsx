/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  UploadCloud, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Category } from "../types";

interface CategoryFormViewProps {
  editingCategory?: Category | null;
  onSaveCategory: (category: Partial<Category>) => void;
  onCancel: () => void;
}

export const CategoryFormView: React.FC<CategoryFormViewProps> = ({
  editingCategory,
  onSaveCategory,
  onCancel
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLive, setIsLive] = useState(true);

  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const generateSlugOfName = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setSlug(editingCategory.slug);
      setDescription(editingCategory.description);
      setImageUrl(editingCategory.imageUrl);
      setIsLive(editingCategory.isLive);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setIsLive(true);
    }
  }, [editingCategory]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(generateSlugOfName(val));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Định dạng file phải là hình ảnh (.jpg, .png, .webp).");
      return;
    }
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg("Tên danh mục không được để trống.");
      return;
    }
    if (!slug.trim()) {
      setErrorMsg("Đường dẫn SEO (Slug) không được để trống.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("Lưu thông tin danh mục thành công!");

    const payload: Partial<Category> = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600",
      isLive,
      lastUpdated: new Date().toLocaleDateString(),
      updatedBy: "Admin"
    };

    if (editingCategory) {
      payload.id = editingCategory.id;
      payload.productCount = editingCategory.productCount;
    } else {
      payload.productCount = 0;
    }

    setTimeout(() => {
      onSaveCategory(payload);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans text-left pb-12">
      {/* Return button & header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách danh mục
        </button>
        <span className="text-xs text-zinc-400 font-mono">
          {editingCategory ? `Sửa danh mục: ${editingCategory.name}` : "Tạo danh mục mới"}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Cập nhật thông tin chi tiết và trạng thái hiển thị của danh mục
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Category Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Tên danh mục <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: Áo Nam, Quần Jeans, Phụ Kiện..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white font-semibold"
              />
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Đường dẫn SEO (Slug) <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-lg overflow-hidden border border-zinc-200">
                <span className="bg-zinc-100 text-zinc-500 px-3 py-2 text-xs font-mono border-r border-zinc-200 font-medium">
                  /category/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ao-nam"
                  className="flex-1 bg-zinc-50 px-3 py-2 text-xs font-mono focus:outline-none focus:bg-white text-zinc-900 font-semibold"
                />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Trạng thái hiển thị
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLive(true)}
                  className={`text-xs font-semibold py-2 px-4 rounded-lg border transition-all flex-1 ${
                    isLive
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Đang hiển thị (LIVE)
                </button>
                <button
                  type="button"
                  onClick={() => setIsLive(false)}
                  className={`text-xs font-semibold py-2 px-4 rounded-lg border transition-all flex-1 ${
                    !isLive
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Tạm ẩn (DRAFT)
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Mô tả danh mục
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả cho danh mục sản phẩm..."
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white font-medium"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Ảnh đại diện danh mục
              </label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  dragActive 
                    ? "border-zinc-900 bg-zinc-100" 
                    : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50"
                }`}
              >
                <input
                  type="file"
                  id="category-file-upload"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {imageUrl ? (
                  <div className="space-y-3">
                    <img 
                      src={imageUrl} 
                      alt="Category preview" 
                      className="w-20 h-20 object-cover rounded-lg mx-auto border border-zinc-200 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Bỏ ảnh
                    </button>
                  </div>
                ) : (
                  <label htmlFor="category-file-upload" className="cursor-pointer space-y-2 block">
                    <UploadCloud className="h-6 w-6 text-zinc-400 mx-auto" />
                    <span className="text-xs font-semibold text-zinc-700 block">Kéo thả ảnh hoặc chọn tệp</span>
                  </label>
                )}
              </div>

              <input
                type="url"
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Hoặc dán đường dẫn (URL) ảnh..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 mt-2 font-medium"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-100 text-xs font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs"
            >
              <Save className="h-4 w-4" />
              {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

