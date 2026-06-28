/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  UploadCloud, 
  Sparkles, 
  Save, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Product, ProductStatus } from "../types";

interface ProductFormViewProps {
  editingProduct?: Product | null;
  categories: string[];
  onSaveProduct: (product: Partial<Product>) => void;
  onCancel: () => void;
}

export const ProductFormView: React.FC<ProductFormViewProps> = ({
  editingProduct,
  categories,
  onSaveProduct,
  onCancel
}) => {
  // Local form states
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(1);
  const [status, setStatus] = useState<ProductStatus>(ProductStatus.ACTIVE);
  const [imageUrl, setImageUrl] = useState("");
  
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Populate form if we are editing an existing item
  useEffect(() => {
    if (editingProduct) {
      setSku(editingProduct.sku);
      setName(editingProduct.name);
      setDescription(editingProduct.description);
      setCategoryName(editingProduct.categoryName);
      setPrice(editingProduct.price);
      setStock(editingProduct.stock);
      setStatus(editingProduct.status);
      setImageUrl(editingProduct.imageUrl);
    } else {
      // Default to first category if available
      setCategoryName(categories[0] || "Apparel");
      // Autogenerate a premium SKU placeholder
      const rand = Math.floor(1000 + Math.random() * 9000);
      setSku(`TRN-${rand}`);
    }
  }, [editingProduct, categories]);

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process custom image file input
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng tải lên tài liệu định dạng hình ảnh phù hợp (.jpg, .png, .webp).");
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

  // Submit Action Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!name.trim()) {
      setErrorMsg("Tên sản phẩm thiết kế không được để trống.");
      return;
    }
    if (price <= 0) {
      setErrorMsg("Mức giá bán ra phải lớn hơn 0 VND.");
      return;
    }
    if (stock < 0) {
      setErrorMsg("Số lượng tồn kho phải là một số không âm.");
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg("Vui lòng đính kèm đường dẫn ảnh hoặc tải ảnh lên để có giao diện trực quan.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("Lưu dữ liệu sản phẩm thành công!");

    // Construct submission object
    const payload: Partial<Product> = {
      sku: sku.toUpperCase().trim(),
      name: name.trim(),
      description: description.trim(),
      categoryName,
      price,
      stock,
      status,
      imageUrl: imageUrl.trim(),
      lastModified: "Vừa xong"
    };

    if (editingProduct) {
      payload.id = editingProduct.id;
    }

    // Delay callback so user perceives smooth system transition feedback
    setTimeout(() => {
      onSaveProduct(payload);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-left">
      
      {/* Return button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#1b1c1c] uppercase tracking-wider font-sans transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách kho
        </button>
        <span className="font-mono text-[10px] text-neutral-400 uppercase">
          {editingProduct ? "Bản sửa đổi: ID " + editingProduct.id : "Khởi tạo thiết kế mới"}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-[#cfc4c5]/40 custom-shadow overflow-hidden">
        
        {/* Visual Title Banner */}
        <div className="p-8 border-b border-[#cfc4c5]/30 bg-[#fbf9f9] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#6c5e06]" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#6c5e06] uppercase font-bold">
                Luxury curation
              </span>
            </div>
            <h3 className="font-serif text-2xl tracking-normal text-[#1b1c1c] font-medium mt-2">
              {editingProduct ? "Cắt Sửa Chi Tiết Sản Phẩm" : "Tuyển Chọn Thiết Kế Sang Trọng"}
            </h3>
            <p className="font-sans text-xs text-neutral-400 mt-1">
              Điền các thông số sản xuất, mã nhận diện (SKU) và gắn tệp hình ảnh phác thảo của bộ sưu tập sang trọng này.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Notifications logs inside form */}
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

          {/* Dual blocks layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Block: Product Details fields */}
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                {/* SKU Code Input */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                    Mã sản xuất (SKU)
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="TRN-XXXX"
                    className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-2.5 text-xs font-mono tracking-widest uppercase focus:outline-none focus:border-[#6c5e06] focus:bg-white"
                  />
                </div>
                
                {/* Category Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                    Phân nhóm danh mục
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-700"
                  >
                    {categories.map((catName) => (
                      <option key={catName} value={catName}>{catName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Design Name Input */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                  Tên sản phẩm thiết kế *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Silk Evening Blazer..."
                  className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800 font-medium"
                />
              </div>

              {/* Price and Stock levels inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price (VNĐ or USD based on structure) */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                    Giá trị niêm yết (VND / $) *
                  </label>
                  <input
                    type="number"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="Ví dụ: 450"
                    className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-[#6c5e06] focus:bg-white"
                    min="0"
                    step="any"
                  />
                </div>

                {/* Remaining Stock */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                    Số lượng nhập kho *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="Ví dụ: 12"
                    className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-[#6c5e06] focus:bg-white"
                    min="0"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                  Trạng thái bày bán
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(ProductStatus).map((statOption) => (
                    <button
                      key={statOption}
                      type="button"
                      onClick={() => setStatus(statOption)}
                      className={`font-sans text-[10px] font-bold uppercase tracking-wider py-2.5 px-3 rounded-lg border text-center transition-all ${
                        status === statOption
                          ? "bg-[#1b1c1c] text-white border-transparent"
                          : "bg-[#fbf9f9] text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {statOption === ProductStatus.ACTIVE ? "Đang bán" : statOption === ProductStatus.DRAFT ? "Lưu nháp" : "Lưu trữ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Long Description Textarea */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans mb-1.5">
                  Mô tả phong cách & Vật liệu
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lịch sử sáng tác phong cách thượng lưu, tay nghề dệt may, chất lượng lụa tự nhiên..."
                  rows={4}
                  className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-700 leading-relaxed"
                />
              </div>

            </div>

            {/* Right Block: Image drop zone and remote URL reference */}
            <div className="space-y-6 flex flex-col justify-between">
              
              {/* Image Input Selection Container */}
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-sans">
                  Hình ảnh trưng bày bộ sưu tập *
                </label>

                {/* Drag and drop interactive area with file loading capabilities */}
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
                    id="image-file-upload"
                    multiple={false}
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  {imageUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-[3/4] max-w-[190px] mx-auto rounded-lg overflow-hidden border border-neutral-200 shadow-inner bg-white">
                        <img 
                          src={imageUrl} 
                          alt="Layout Curation Draft" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="font-sans text-[10px] text-neutral-400">
                        Phác thảo hình ảnh tải lên thành công. Kéo thả file khác để thay đổi.
                      </p>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-[9px] font-mono text-rose-500 font-bold uppercase hover:underline"
                      >
                        Gỡ bỏ ảnh phác thảo
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="image-file-upload" className="cursor-pointer space-y-3 block">
                      <div className="mx-auto w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#6c5e06] shadow-sm">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-sans text-[11px] font-bold text-neutral-700 block">
                          Tải ảnh phác thảo từ thiết bị
                        </span>
                        <span className="font-sans text-[10px] text-neutral-400 block pb-1">
                          hoặc thả tập tin vào khung này
                        </span>
                        <span className="inline-block bg-white border border-neutral-200 text-[9px] font-bold uppercase tracking-wider font-sans px-3 py-1.5 rounded-lg shadow-sm hover:border-[#6c5e06]">
                          Chọn File ảnh
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-y-1/2 left-0 right-0 h-[1px] bg-neutral-100" />
                  <span className="relative bg-white px-3 font-mono text-[9px] text-neutral-300 uppercase">Hoặc dán URL ảnh trực tiếp</span>
                </div>

                {/* Direct image input URL box */}
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 bg-neutral-100 rounded-lg text-neutral-400 border border-neutral-200">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Chèn URL ảnh trực tuyến..."
                    className="flex-1 bg-[#fbf9f9] border border-neutral-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800"
                  />
                </div>
              </div>

              {/* Sample high quality luxury suggestions widgets as presets if URL remains empty */}
              {!imageUrl && (
                <div className="p-4 bg-[#6c5e06]/5 border border-[#6c5e06]/10 rounded-xl space-y-2 text-left">
                  <p className="font-sans text-[10px] font-bold text-[#6c5e06] uppercase tracking-wider">Mẫu ảnh lầu năm Haute-Couture:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600")}
                      className="text-[9px] font-sans text-neutral-600 bg-white hover:bg-[#6c5e06]/10 p-2 rounded border border-neutral-200 truncate block text-left"
                    >
                      Bộ váy thiết kế lụa vàng
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600")}
                      className="text-[9px] font-sans text-neutral-600 bg-white hover:bg-[#6c5e06]/10 p-2 rounded border border-neutral-200 truncate block text-left"
                    >
                      Bốt da cao cấp
                    </button>
                  </div>
                </div>
              )}

              {/* Action submission buttons block */}
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
                  {editingProduct ? "Lưu thay đổi thiết kế" : "Bắt đầu niêm yết"}
                </button>
              </div>

            </div>

          </div>

        </form>
      </div>

    </div>
  );
};
