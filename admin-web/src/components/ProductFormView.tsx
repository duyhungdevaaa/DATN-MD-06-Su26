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
  AlertCircle,
  Package
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

  // Product variants state management
  const [hasVariants, setHasVariants] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [variants, setVariants] = useState<Array<{ size: string; color: string; quantity: number }>>([]);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  // Regenerate combinations when sizes or colors change
  const syncVariants = (newSizes: string[], newColors: string[]) => {
    const updatedVariants: Array<{ size: string; color: string; quantity: number }> = [];
    
    newSizes.forEach(s => {
      newColors.forEach(c => {
        const existing = variants.find(v => v.size === s && v.color === c);
        updatedVariants.push({
          size: s,
          color: c,
          quantity: existing ? existing.quantity : 0
        });
      });
    });
    
    setVariants(updatedVariants);
  };

  const handleAddSize = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") return;
    if (e.type === "keydown") (e as React.KeyboardEvent).preventDefault();
    
    const size = newSize.trim().toUpperCase();
    if (size && !sizes.includes(size)) {
      const updatedSizes = [...sizes, size];
      setSizes(updatedSizes);
      setNewSize("");
      syncVariants(updatedSizes, colors);
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const updatedSizes = sizes.filter(s => s !== sizeToRemove);
    setSizes(updatedSizes);
    syncVariants(updatedSizes, colors);
  };

  const handleAddColor = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") return;
    if (e.type === "keydown") (e as React.KeyboardEvent).preventDefault();

    const color = newColor.trim();
    if (color && !colors.includes(color)) {
      const updatedColors = [...colors, color];
      setColors(updatedColors);
      setNewColor("");
      syncVariants(sizes, updatedColors);
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const updatedColors = colors.filter(c => c !== colorToRemove);
    setColors(updatedColors);
    syncVariants(sizes, updatedColors);
  };

  const handleVariantQuantityChange = (size: string, color: string, qty: number) => {
    const updated = variants.map(v => {
      if (v.size === size && v.color === color) {
        return { ...v, quantity: Math.max(0, qty) };
      }
      return v;
    });
    setVariants(updated);
    
    const totalQty = updated.reduce((sum, v) => sum + v.quantity, 0);
    setStock(totalQty);
  };

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
      
      const prodSizes = editingProduct.sizes || [];
      const prodColors = editingProduct.colors || [];
      const prodVariants = editingProduct.variants || [];
      setSizes(prodSizes);
      setColors(prodColors);
      setVariants(prodVariants);
      setHasVariants(prodVariants.length > 0 || prodSizes.length > 0 || prodColors.length > 0);
    } else {
      // Default to first category if available
      setCategoryName(categories[0] || "Apparel");
      // Autogenerate a premium SKU placeholder
      const rand = Math.floor(1000 + Math.random() * 9000);
      setSku(`TRN-${rand}`);
      setSizes([]);
      setColors([]);
      setVariants([]);
      setHasVariants(false);
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
      stock: hasVariants ? variants.reduce((sum, v) => sum + v.quantity, 0) : stock,
      status,
      imageUrl: imageUrl.trim(),
      lastModified: "Vừa xong",
      sizes: hasVariants ? sizes : [],
      colors: hasVariants ? colors : [],
      variants: hasVariants ? variants : []
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
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-left font-sans">
      
      {/* Return button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-wider font-sans transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách kho
        </button>
        <span className="font-mono text-[9px] text-zinc-400 uppercase font-bold">
          {editingProduct ? "Bản sửa đổi: ID " + editingProduct.id : "Khởi tạo thiết kế mới"}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden">
        
        {/* Visual Title Banner */}
        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8c7623]" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#8c7623] uppercase font-bold">
                Luxury curation
              </span>
            </div>
            <h3 className="font-serif text-2xl tracking-normal text-zinc-950 font-bold mt-2">
              {editingProduct ? "Cắt Sửa Chi Tiết Sản Phẩm" : "Tuyển Chọn Thiết Kế Sang Trọng"}
            </h3>
            <p className="font-sans text-xs text-zinc-450 mt-1 leading-relaxed">
              Điền các thông số sản xuất, mã nhận diện (SKU) và gắn tệp hình ảnh phác thảo của bộ sưu tập sang trọng này.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Notifications logs inside form */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2.5">
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
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans mb-1.5">
                    Mã sản xuất (SKU)
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="TRN-XXXX"
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-xs font-mono tracking-widest uppercase focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-800 font-bold"
                  />
                </div>
                
                {/* Category Dropdown */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans mb-1.5">
                    Phân nhóm danh mục
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-700 font-bold"
                  >
                    {categories.map((catName) => (
                      <option key={catName} value={catName}>{catName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Design Name Input */}
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans mb-1.5">
                  Tên sản phẩm thiết kế *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Silk Evening Blazer..."
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 text-xs font-sans focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-850 font-bold"
                />
              </div>

              {/* Price and Stock levels inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price (VNĐ or USD based on structure) */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans mb-1.5">
                    Giá trị niêm yết (VND / $) *
                  </label>
                  <input
                    type="number"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="Ví dụ: 450"
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-850"
                    min="0"
                    step="any"
                  />
                </div>

                {/* Remaining Stock */}
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans mb-1.5">
                    Số lượng nhập kho *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="Ví dụ: 12"
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-850"
                    min="0"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans mb-1.5">
                  Trạng thái bày bán
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(ProductStatus).map((statOption) => (
                    <button
                      key={statOption}
                      type="button"
                      onClick={() => setStatus(statOption)}
                      className={`font-sans text-[10px] font-bold uppercase tracking-wider py-3 px-3 rounded-xl border text-center transition-all ${
                        status === statOption
                          ? "bg-zinc-900 text-white border-transparent shadow-sm"
                          : "bg-zinc-55 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                      }`}
                    >
                      {statOption === ProductStatus.ACTIVE ? "Đang bán" : statOption === ProductStatus.DRAFT ? "Lưu nháp" : "Lưu trữ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Long Description Textarea */}
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans mb-1.5">
                  Mô tả phong cách & Vật liệu
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lịch sử sáng tác phong cách thượng lưu, tay nghề dệt may, chất lượng lụa tự nhiên..."
                  rows={4}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 text-xs font-sans focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-700 leading-relaxed font-medium"
                />
              </div>

            </div>

            {/* Right Block: Image drop zone and remote URL reference */}
            <div className="space-y-6 flex flex-col justify-between">
              
              {/* Image Input Selection Container */}
              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
                  Hình ảnh trưng bày bộ sưu tập *
                </label>

                {/* Drag and drop interactive area with file loading capabilities */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative ${
                    dragActive 
                      ? "border-[#8c7623] bg-[#8c7623]/5" 
                      : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50"
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
                      <div className="aspect-[3/4] max-w-[190px] mx-auto rounded-xl overflow-hidden border border-zinc-200/60 shadow-md bg-white">
                        <img 
                          src={imageUrl} 
                          alt="Layout Curation Draft" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="font-sans text-[10px] text-zinc-450 font-medium">
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
                      <div className="mx-auto w-12 h-12 rounded-full bg-white border border-zinc-150 flex items-center justify-center text-[#8c7623] shadow-sm">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-sans text-xs font-bold text-zinc-700 block">
                          Tải ảnh phác thảo từ thiết bị
                        </span>
                        <span className="font-sans text-[10px] text-zinc-400 block pb-1">
                          hoặc thả tập tin vào khung này
                        </span>
                        <span className="inline-block bg-white border border-zinc-200 text-[9px] font-bold uppercase tracking-wider font-sans px-4 py-2 rounded-xl shadow-sm hover:border-[#8c7623] transition-colors">
                          Chọn File ảnh
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-y-1/2 left-0 right-0 h-[1px] bg-zinc-100" />
                  <span className="relative bg-white px-3 font-mono text-[9px] text-zinc-300 uppercase font-bold tracking-wider">Hoặc dán URL ảnh trực tiếp</span>
                </div>

                {/* Direct image input URL box */}
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 bg-zinc-100 rounded-xl text-zinc-400 border border-zinc-200">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Chèn URL ảnh trực tuyến..."
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-800 font-medium"
                  />
                </div>
              </div>

              {/* Sample suggestions widgets */}
              {!imageUrl && (
                <div className="p-4 bg-[#8c7623]/5 border border-[#8c7623]/10 rounded-2xl space-y-2.5 text-left">
                  <p className="font-sans text-[10px] font-bold text-[#8c7623] uppercase tracking-wider">Mẫu ảnh gợi ý có sẵn:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600")}
                      className="text-[9px] font-sans text-zinc-650 bg-white hover:bg-[#8c7623]/10 hover:text-[#8c7623] hover:border-[#8c7623]/30 p-2.5 rounded-lg border border-zinc-200 truncate block text-left font-bold transition-all"
                    >
                      Bộ váy thiết kế lụa vàng
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600")}
                      className="text-[9px] font-sans text-zinc-650 bg-white hover:bg-[#8c7623]/10 hover:text-[#8c7623] hover:border-[#8c7623]/30 p-2.5 rounded-lg border border-zinc-200 truncate block text-left font-bold transition-all"
                    >
                      Bốt da cao cấp
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Variants Management Card */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200/50 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-[#8c7623]" />
                <h4 className="font-serif text-base text-zinc-950 font-bold">
                  Phân Loại Biến Thể Sản Phẩm (Kích cỡ & Màu sắc)
                </h4>
              </div>
              
              {/* Variant toggle button */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c7623]"></div>
                <span className="ml-3 text-xs font-bold text-zinc-700 uppercase tracking-wider flex-shrink-0">
                  Có nhiều kích cỡ/màu sắc
                </span>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sizes Tag input */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
                      Quản lý kích cỡ (Sizes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        onKeyDown={handleAddSize}
                        placeholder="Nhập kích cỡ (ví dụ: S, M, L, 39, 40) rồi Enter"
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-800 font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="bg-zinc-900 hover:bg-[#8c7623] text-white px-4 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                      >
                        Thêm
                      </button>
                    </div>
                    
                    {/* Sizes list tags wrapper */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {sizes.map(size => (
                        <span key={size} className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200/60 text-zinc-700 font-sans text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors">
                          {size}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(size)}
                            className="text-zinc-450 hover:text-rose-500 font-bold ml-1 cursor-pointer focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {sizes.length === 0 && (
                        <span className="text-[11px] text-zinc-405 font-semibold italic">Chưa khai báo kích cỡ nào</span>
                      )}
                    </div>
                  </div>

                  {/* Colors Tag input */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
                      Quản lý màu sắc (Colors)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onKeyDown={handleAddColor}
                        placeholder="Nhập màu sắc (ví dụ: Đen, Trắng, Kem) rồi Enter"
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-800 font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="bg-zinc-900 hover:bg-[#8c7623] text-white px-4 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                      >
                        Thêm
                      </button>
                    </div>

                    {/* Colors list tags wrapper */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {colors.map(color => (
                        <span key={color} className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200/60 text-zinc-700 font-sans text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors">
                          {color}
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(color)}
                            className="text-zinc-450 hover:text-rose-500 font-bold ml-1 cursor-pointer focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {colors.length === 0 && (
                        <span className="text-[11px] text-zinc-405 font-semibold italic">Chưa khai báo màu sắc nào</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Variants Combinations Inventory Allocation list */}
                {variants.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100 space-y-3">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
                      Bảng phân bổ số lượng tồn kho theo biến thể
                    </label>
                    
                    <div className="max-h-72 overflow-y-auto border border-zinc-200 rounded-xl divide-y divide-zinc-100 shadow-inner">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                          <tr>
                            <th className="p-3">Biến thể kích cỡ / màu sắc</th>
                            <th className="p-3 text-right">Số lượng nhập kho</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {variants.map((v, index) => (
                            <tr key={index} className="hover:bg-zinc-50/40 transition-colors">
                              <td className="p-3 font-semibold text-zinc-800">
                                Size <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 font-bold font-mono mr-1.5">{v.size}</span>
                                — Màu <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 font-bold mr-1.5">{v.color}</span>
                              </td>
                              <td className="p-3 text-right">
                                <input
                                  type="number"
                                  value={v.quantity}
                                  onChange={(e) => handleVariantQuantityChange(v.size, v.color, Number(e.target.value))}
                                  min="0"
                                  className="w-24 bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-right font-mono font-bold focus:outline-none focus:border-[#8c7623] focus:bg-white transition-all text-zinc-800"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <p className="text-[10px] text-zinc-455 font-bold text-right italic pt-1">
                      Tổng số lượng tự động tính gộp: <strong className="text-zinc-700 font-mono">{stock}</strong> sản phẩm.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action submission buttons block */}
          <div className="flex items-center gap-4 pt-6 border-t border-zinc-150 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-zinc-300 rounded-xl text-zinc-700 hover:bg-zinc-50 font-sans text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-[#8c7623] text-white px-7 py-3 rounded-xl text-xs font-bold tracking-wider uppercase font-sans transition-all duration-300 shadow-md shadow-zinc-900/5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {editingProduct ? "Lưu thay đổi thiết kế" : "Bắt đầu niêm yết"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
