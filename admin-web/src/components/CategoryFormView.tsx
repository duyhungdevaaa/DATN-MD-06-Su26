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
  // Local form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLive, setIsLive] = useState(true);

  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Helper parser to auto generate friendly slugs from Vietnamese or English text
  const generateSlugOfName = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent diacritics
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .trim()
      .replace(/\s+/g, "-"); // replace space with dashes
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

  // Handle Name typing to generate default web path slug automatically
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(generateSlugOfName(val));
    }
  };

  // Drag & drop file reader handlers
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
      setErrorMsg("Tên danh mục phân loại không được phép bỏ trống.");
      return;
    }
    if (!slug.trim()) {
      setErrorMsg("Đường dẫn nhận dạng (Slug) không được trống.");
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg("Vui lòng thiết lập hình ảnh đại diện cho nhóm danh mục.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("Lưu thông tin danh mục thành công!");

    const payload: Partial<Category> = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      isLive,
      lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updatedBy: "Alexander Vane"
    };

    if (editingCategory) {
      payload.id = editingCategory.id;
      // preserve old counters
      payload.productCount = editingCategory.productCount;
    } else {
      payload.productCount = 0;
    }

    setTimeout(() => {
      onSaveCategory(payload);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-left">
      
      {/* Return header banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#1b1c1c] uppercase tracking-wider font-sans transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại bản danh mục
        </button>
        <span className="font-mono text-[10px] text-neutral-400 uppercase">
          {editingCategory ? "Biên tả: ID " + editingCategory.id : "Khai phá Danh mục mới"}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-[#cfc4c5]/40 custom-shadow overflow-hidden">
        
        {/* Editorial Title Header */}
        <div className="p-8 border-b border-[#cfc4c5]/30 bg-[#fbf9f9]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#6c5e06]" />
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#6c5e06] uppercase font-bold">
              Collections index
            </span>
          </div>
          <h3 className="font-serif text-2xl tracking-normal text-[#1b1c1c] font-medium mt-2">
            {editingCategory ? "Cải tạo Thông tin Danh mục" : "Đón đầu Phân nhóm thời trang"}
          </h3>
          <p className="font-sans text-xs text-neutral-400 mt-1">
            Gửi gắm miêu tả gợi cảm hứng, tinh chỉnh đường dẫn slug bám theo chuẩn SEO, quyết định trưng bày live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium font-sans flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-medium font-sans flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Layout Split Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Block Information */}
            <div className="space-y-6">
              
              {/* Category Name input */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                  Tên danh mục mới *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Đầm tối muộn, Trang sức..."
                  className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800 font-medium"
                />
              </div>

              {/* URL Custom Slug Entry */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                  Đường dẫn SEO (Slug URL) *
                </label>
                <div className="flex rounded-lg overflow-hidden border border-neutral-200">
                  <span className="bg-neutral-100 text-neutral-400 px-3 py-2.5 text-xs font-mono border-r border-neutral-200">
                    /category/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="dung-dan-seo-tu-dong"
                    className="flex-1 bg-[#fbf9f9] p-2.5 text-xs font-mono tracking-wider focus:outline-none focus:bg-white text-neutral-800"
                  />
                </div>
              </div>

              {/* Live Availability Toggle Button Option */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                  Đưa lên thị trường trực tuyến (Live Status)
                </label>
                <div className="flex gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => setIsLive(true)}
                    className={`font-sans text-[10px] font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg border text-center transition-all ${
                      isLive
                        ? "bg-[#1b1c1c] text-white border-transparent"
                        : "bg-[#fbf9f9] text-neutral-500 border-neutral-200"
                    }`}
                  >
                    BẬT CHẾ ĐỘ HIỂN THỊ (LIVE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLive(false)}
                    className={`font-sans text-[10px] font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg border text-center transition-all ${
                      !isLive
                        ? "bg-rose-600 text-white border-transparent"
                        : "bg-[#fbf9f9] text-neutral-500 border-neutral-200"
                    }`}
                  >
                    TẠM ẨN TRONG KHO (DRAFT)
                  </button>
                </div>
              </div>

              {/* Description of subcurations */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                  Mô tả định hướng thời trang cha
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Gợi mở: Đồ lót cao cấp, Khăn lụa tơ tằm nguyên chất hoặc giày gót nhọn thủ công..."
                  rows={4}
                  className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-700 leading-relaxed"
                />
              </div>

            </div>

            {/* Right Block Cover Upload Image */}
            <div className="space-y-6 flex flex-col justify-between">
              
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans">
                  Ảnh bìa danh mục trưng bày *
                </label>

                {/* Drag-and-drop cover category image */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative ${
                    dragActive 
                      ? "border-[#6c5e06] bg-[#6c5e06]/5" 
                      : "border-neutral-200 bg-[#fbf9f9] hover:bg-neutral-50/50"
                  }`}
                >
                  <input
                    type="file"
                    id="category-file-upload"
                    multiple={false}
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  {imageUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-[4/3] max-w-[240px] mx-auto rounded-lg overflow-hidden border border-neutral-200 shadow-inner bg-white">
                        <img 
                          src={imageUrl} 
                          alt="Cover category draft preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="font-sans text-[10px] text-neutral-400">
                        Ảnh chất tải thành công. Kéo thả file khác để thay đổi.
                      </p>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-[9px] font-mono text-rose-500 font-bold uppercase hover:underline"
                      >
                        Bỏ ảnh đại diện
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="category-file-upload" className="cursor-pointer space-y-3 block">
                      <div className="mx-auto w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#6c5e06] shadow-sm">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-sans text-[11px] font-bold text-neutral-700 block">
                          Tải ảnh bìa danh mục đại diện
                        </span>
                        <span className="font-sans text-[10px] text-neutral-400 block pb-1">
                          Kéo thả tệp tin ảnh vào vùng này
                        </span>
                        <span className="inline-block bg-white border border-neutral-200 text-[9px] font-bold uppercase tracking-wider font-sans px-3 py-1.5 rounded-lg shadow-sm hover:border-[#6c5e06]">
                          Chọn File
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-y-1/2 left-0 right-0 h-[1px] bg-neutral-100" />
                  <span className="relative bg-white px-3 font-mono text-[9px] text-neutral-300 uppercase">Hoặc liên kết ảnh trực tiếp</span>
                </div>

                {/* Direct image input URL box */}
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 bg-neutral-100 rounded-lg text-neutral-400 border border-neutral-200">
                    <LinkIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Chèn link ảnh trực tuyến..."
                    className="flex-1 bg-[#fbf9f9] border border-neutral-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800"
                  />
                </div>
              </div>

              {/* Action layout controls */}
              <div className="flex items-center gap-4 pt-6 mt-auto border-t border-neutral-100 lg:justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 font-sans text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#6c5e06] hover:bg-[#1b1c1c] text-white px-7 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase font-sans transition-all duration-300 shadow-md"
                >
                  <Save className="h-4 w-4" />
                  {editingCategory ? "Lưu thông tin phân loại" : "Khai mở danh mục"}
                </button>
              </div>

            </div>

          </div>

        </form>
      </div>

    </div>
  );
};
