/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  CheckCircle2,
  PackageX,
  RefreshCw
} from "lucide-react";
import { Product, ProductStatus } from "../types";

interface InventoryViewProps {
  products: Product[];
  searchText: string;
  onAddProductClick: () => void;
  onEditProductClick: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  searchText,
  onAddProductClick,
  onEditProductClick,
  onDeleteProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("All");
  const [statusTab, setStatusTab] = useState<ProductStatus>(ProductStatus.ACTIVE);

  // Formats price gracefully
  const formatPrice = (price: number) => {
    // If priced in USD (standard) or automatically in VND
    if (price < 10000) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
    }
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  // Find unique categories for the filters
  const availableCategories = ["All", ...Array.from(new Set(products.map(p => p.categoryName)))];

  // Filters logic
  const filteredProducts = products.filter(product => {
    // Search filter (handles input passed down from header or custom searches)
    const matchesSearch = 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === "All" || product.categoryName === selectedCategory;

    // Status tab filter
    const matchesStatus = product.status === statusTab;

    // Stock level filter
    let matchesStock = true;
    if (stockFilter === "in_stock") {
      matchesStock = product.stock >= 5;
    } else if (stockFilter === "low_stock") {
      matchesStock = product.stock > 0 && product.stock < 5;
    } else if (stockFilter === "out_of_stock") {
      matchesStock = product.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  // Action confirmations
  const handleDeleteCheck = (id: string, name: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác.`);
    if (isConfirmed) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Search and control filter line */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
        
        {/* Horizontal filter options */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Active status tab selector */}
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/40">
            {Object.values(ProductStatus).map((status) => (
              <button
                key={status}
                onClick={() => setStatusTab(status)}
                className={`text-[10px] uppercase font-bold tracking-wider px-4.5 py-1.5 rounded-lg transition-all duration-200 ${
                  statusTab === status 
                    ? "bg-white text-zinc-900 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {status === ProductStatus.ACTIVE ? "Đang bán" : status === ProductStatus.DRAFT ? "Lưu nháp" : "Lưu trữ"}
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-zinc-250 hidden sm:block" />

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Danh mục:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none focus:bg-white font-sans text-zinc-700 font-medium"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "Tất cả danh mục" : cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Trong kho:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none focus:bg-white font-sans text-zinc-700 font-medium"
            >
              <option value="All">Tất cả số lượng</option>
              <option value="in_stock">Còn hàng (≥ 5)</option>
              <option value="low_stock">Sắp hết hàng (1-4)</option>
              <option value="out_of_stock">Hết hàng (0)</option>
            </select>
          </div>

        </div>

        {/* Master Addition Button */}
        <button
          onClick={onAddProductClick}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white hover:bg-[#8c7623] px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase font-sans transition-all duration-200 shadow-md shadow-zinc-900/5 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Khai báo sản phẩm mới
        </button>
      </div>

      {/* Product List Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-16 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="font-serif text-lg text-zinc-800 font-medium">Không tìm thấy sản phẩm nào</h3>
          <p className="font-sans text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Vui lòng thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc danh mục/trạng thái hàng hóa.
          </p>
          <button 
            onClick={() => {
              setSelectedCategory("All");
              setStockFilter("All");
              setStatusTab(ProductStatus.ACTIVE);
            }} 
            className="mt-6 text-xs text-[#8c7623] font-bold tracking-wider uppercase hover:underline"
          >
            Reset bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            // Determine stock pill styles
            let stockPillStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";
            let stockLabel = `Còn hàng: ${product.stock}`;
            let StockIcon = CheckCircle2;

            if (product.stock === 0) {
              stockPillStyle = "bg-rose-50 text-rose-700 border-rose-100";
              stockLabel = "Hết hàng hoàn toàn";
              StockIcon = PackageX;
            } else if (product.stock < 5) {
              stockPillStyle = "bg-amber-50 text-amber-700 border-amber-100";
              stockLabel = `Sắp hết hàng: còn ${product.stock}`;
              StockIcon = AlertTriangle;
            }

            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-[#8c7623]/40 hover:shadow-md transition-all duration-350"
              >
                {/* Product Frame and Image with direct preview link */}
                <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden border-b border-zinc-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover editorial-img group-hover:scale-102"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600";
                    }}
                  />
                  {/* Category overlay */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm shadow-sm border border-zinc-100 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#8c7623] font-mono">
                    {product.categoryName}
                  </span>

                  {/* SKU overlay */}
                  <span className="absolute bottom-3 left-3 bg-zinc-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase">
                    SKU: {product.sku}
                  </span>
                </div>

                {/* Body Meta curation details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-base text-zinc-900 font-bold tracking-tight line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="font-sans text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Bán giá gốc</span>
                      <strong className="font-mono text-base text-zinc-950 font-bold">
                        {formatPrice(product.price)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-sans ${stockPillStyle}`}>
                        <StockIcon className="h-3 w-3 shrink-0" />
                        {stockLabel}
                      </span>
                    </div>

                    {/* Interactive Action Ribbon */}
                    <div className="flex items-center justify-between pt-3.5 border-t border-zinc-100">
                      <span className="font-mono text-[9px] text-zinc-400">
                        {product.lastModified || "Mới tạo"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditProductClick(product)}
                          className="p-1 px-2.5 bg-zinc-50 hover:bg-[#8c7623]/10 text-zinc-650 hover:text-[#8c7623] text-[10px] uppercase font-bold tracking-wider font-sans rounded-lg border border-zinc-200/80 transition-colors duration-200 flex items-center gap-1"
                          title="Chỉnh sửa chi tiết"
                        >
                          <Edit3 className="h-3 w-3" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCheck(product.id, product.name)}
                          className="p-1 px-2.5 bg-zinc-50 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 text-[10px] uppercase font-bold tracking-wider font-sans rounded-lg border border-zinc-200/80 transition-colors duration-200 flex items-center gap-1"
                          title="Xóa khỏi hệ thống"
                        >
                          <Trash2 className="h-3 w-3" />
                          Xóa
                        </button>
                      </div>
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
