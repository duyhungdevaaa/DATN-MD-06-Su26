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
  const [discount, setDiscount] = useState<number>(0);
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
      setDiscount(editingProduct.discount || 0);
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
      discount,
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-left">

      {/* Return button & header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại kho sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {/* Title */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-xl font-bold text-zinc-900">
            {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Điền đầy đủ thông tin bên dưới để lưu sản phẩm vào hệ thống
          </p>
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

          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Block: Product Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* SKU Code Input */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Mã SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="TRN-1001"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-mono font-semibold uppercase focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900"
                  />
                </div>
                
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Danh mục *
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-800"
                  >
                    {categories.map((catName) => (
                      <option key={catName} value={catName}>{catName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-sm font-semibold focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900"
                />
              </div>

              {/* Price, Discount, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Giá niêm yết (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="450000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="10"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Số lượng tồn *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="10"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900"
                    min="0"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Trạng thái bày bán
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ProductStatus).map((statOption) => (
                    <button
                      key={statOption}
                      type="button"
                      onClick={() => setStatus(statOption)}
                      className={`text-xs font-semibold py-2 px-3 rounded-lg border text-center transition-all ${
                        status === statOption
                          ? "bg-zinc-900 text-white border-transparent shadow-xs"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      {statOption === ProductStatus.ACTIVE ? "Đang bán" : statOption === ProductStatus.DRAFT ? "Lưu nháp" : "Lưu trữ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả kiểu dáng, chất liệu sản phẩm..."
                  rows={4}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-800 leading-relaxed"
                />
              </div>
            </div>

            {/* Right Block: Image drop zone */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-zinc-700">
                Hình ảnh sản phẩm *
              </label>

              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive 
                    ? "border-zinc-900 bg-zinc-100" 
                    : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50"
                }`}
              >
                <input
                  type="file"
                  id="image-file-upload"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {imageUrl ? (
                  <div className="space-y-3">
                    <div className="aspect-[3/4] max-w-[160px] mx-auto rounded-lg overflow-hidden border border-zinc-200 shadow-xs bg-white">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Đổi ảnh khác
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-file-upload" className="cursor-pointer space-y-2 block">
                    <UploadCloud className="h-8 w-8 text-zinc-400 mx-auto" />
                    <span className="text-xs font-semibold text-zinc-700 block">
                      Nhấp để tải ảnh lên hoặc kéo thả vào đây
                    </span>
                    <span className="text-[11px] text-zinc-400 block">Hỗ trợ PNG, JPG, WEBP</span>
                  </label>
                )}
              </div>

              {/* Direct image input URL box */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">
                  Hoặc nhập URL hình ảnh trực tiếp:
                </label>
                <input
                  type="url"
                  value={imageUrl.startsWith("data:") ? "" : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* Variants Management Section */}
          <div className="pt-6 border-t border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-zinc-700" />
                <h4 className="text-sm font-bold text-zinc-900">
                  Biến thể sản phẩm (Kích cỡ & Màu sắc)
                </h4>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900"
                />
                <span className="text-xs font-semibold text-zinc-700">
                  Phân loại theo Size / Màu
                </span>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-600">
                      Kích cỡ (Sizes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        onKeyDown={handleAddSize}
                        placeholder="Ví dụ: S, M, L, XL"
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 rounded-lg text-xs font-semibold"
                      >
                        Thêm
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sizes.map(size => (
                        <span key={size} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                          {size}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(size)}
                            className="text-zinc-400 hover:text-rose-600 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-600">
                      Màu sắc (Colors)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onKeyDown={handleAddColor}
                        placeholder="Ví dụ: Đen, Trắng, Xanh"
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 rounded-lg text-xs font-semibold"
                      >
                        Thêm
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {colors.map(color => (
                        <span key={color} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                          {color}
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(color)}
                            className="text-zinc-400 hover:text-rose-600 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Variants Combinations table */}
                {variants.length > 0 && (
                  <div className="pt-3 space-y-2">
                    <label className="block text-xs font-semibold text-zinc-600">
                      Phân bổ số lượng tồn kho theo biến thể:
                    </label>
                    
                    <div className="max-h-60 overflow-y-auto border border-zinc-200 rounded-lg">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Biến thể (Size - Màu)</th>
                            <th className="p-2.5 text-right">Tồn kho</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {variants.map((v, index) => (
                            <tr key={index}>
                              <td className="p-2.5 font-medium text-zinc-800">
                                Size {v.size} — Màu {v.color}
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  value={v.quantity}
                                  onChange={(e) => handleVariantQuantityChange(v.size, v.color, Number(e.target.value))}
                                  min="0"
                                  className="w-20 bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-right font-semibold focus:outline-none focus:border-zinc-900"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Save className="h-4 w-4" />
              {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

