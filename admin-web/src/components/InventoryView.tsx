/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Trash2,
  Edit3, 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
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
  searchText: globalSearchText,
  onAddProductClick,
  onEditProductClick,
  onDeleteProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("All");
  const [statusTab, setStatusTab] = useState<ProductStatus>(ProductStatus.ACTIVE);
<<<<<<< HEAD
  const [skuSearch, setSkuSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
=======
  const [isSaleOnly, setIsSaleOnly] = useState<boolean>(false);
>>>>>>> origin/main

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  const availableCategories = ["All", ...Array.from(new Set(products.map(p => p.categoryName)))];

  // Filters logic
  const filteredProducts = products.filter(product => {
    const matchesGlobalSearch =
      !globalSearchText ||
      product.name.toLowerCase().includes(globalSearchText.toLowerCase());

    const matchesSkuSearch =
      !skuSearch ||
      product.sku.toLowerCase().includes(skuSearch.toLowerCase());

    const matchesCategory = selectedCategory === "All" || product.categoryName === selectedCategory;
    const matchesStatus = product.status === statusTab;

    let matchesStock = true;
    if (stockFilter === "in_stock") matchesStock = product.stock > 0;
    else if (stockFilter === "out_of_stock") matchesStock = product.stock === 0;

<<<<<<< HEAD
    return matchesGlobalSearch && matchesSkuSearch && matchesCategory && matchesStatus && matchesStock;
=======
    // Sale filter
    const matchesSale = !isSaleOnly || (product.discount && product.discount > 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesSale;
>>>>>>> origin/main
  });

  // Sort logic (mocked)
  const sortedProducts = [...filteredProducts];

  // Pagination logic
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteCheck = (id: string, name: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`);
    if (isConfirmed) {
      onDeleteProduct(id);
    }
  };

  return (
<<<<<<< HEAD
    <div className="space-y-6 animate-fade-in font-sans text-left">
      
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Sản phẩm</h2>
          <p className="text-[14px] text-[#6B7280] font-medium">Quản lý danh sách sản phẩm</p>
        </div>
        <button
          onClick={onAddProductClick}
          className="flex items-center gap-2 bg-[#8c7623] text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all hover:bg-[#7a661c] shadow-lg shadow-[#8c7623]/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Khai báo sản phẩm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          {Object.values(ProductStatus).map((status) => (
            <button
              key={status}
              onClick={() => setStatusTab(status)}
              className={`text-[10px] uppercase font-bold tracking-widest px-5 py-2 rounded-md transition-all ${
                statusTab === status
                  ? "bg-white text-[#8c7623] shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {status === ProductStatus.ACTIVE ? "Đang bán" : status === ProductStatus.DRAFT ? "Lưu nháp" : "Lưu trữ"}
            </button>
          ))}
        </div>
=======
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
>>>>>>> origin/main

        <div className="flex items-center gap-6 ml-4">
          <div className="flex items-center gap-2">
<<<<<<< HEAD
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Danh mục:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border-none bg-transparent text-[13px] font-bold text-neutral-800 focus:ring-0 cursor-pointer"
=======
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Danh mục:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none focus:bg-white font-sans text-zinc-700 font-medium"
>>>>>>> origin/main
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "Tất cả danh mục" : cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
<<<<<<< HEAD
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trong kho:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="border-none bg-transparent text-[13px] font-bold text-neutral-800 focus:ring-0 cursor-pointer"
=======
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Trong kho:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none focus:bg-white font-sans text-zinc-700 font-medium"
>>>>>>> origin/main
            >
              <option value="All">Tất cả số lượng</option>
              <option value="in_stock">Còn hàng</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
          </div>
        </div>

        {/* SKU Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={skuSearch}
            onChange={(e) => setSkuSearch(e.target.value)}
            placeholder="Tìm SKU..."
            className="h-9 w-48 pl-9 pr-3 rounded-lg border border-neutral-200 text-[13px] font-medium focus:ring-2 focus:ring-[#8c7623]/10 focus:border-[#8c7623] outline-none transition-all"
          />
        </div>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="h-9 pl-3 pr-8 rounded-lg border border-neutral-200 text-[13px] font-bold text-neutral-700 focus:ring-2 focus:ring-[#8c7623]/10 focus:border-[#8c7623] outline-none cursor-pointer"
        >
          <option value="newest">Sắp xếp: Mới nhất</option>
          <option value="oldest">Sắp xếp: Cũ nhất</option>
          <option value="price-asc">Giá: Thấp đến cao</option>
          <option value="price-desc">Giá: Cao đến thấp</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {paginatedProducts.map((product) => {
          const isOutOfStock = product.stock === 0;
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Top Badges */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-100 shadow-sm">
                  {product.categoryName}
                </span>

                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border shadow-sm ${
                  isOutOfStock ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}>
                  {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="text-[14px] font-bold text-neutral-900 line-clamp-1 mb-1">{product.name}</h4>
                <p className="text-[15px] font-bold text-neutral-900 mb-2">{formatVND(product.price)}</p>

                <div className="space-y-1 mb-4">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">SKU: {product.sku}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <p className="text-[11px] text-neutral-500 font-bold">Kho: {product.stock}</p>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-neutral-50 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-bold">{product.lastModified || "17/7/2026"}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditProductClick(product)}
                      className="p-1.5 rounded-lg border border-neutral-100 text-neutral-400 hover:text-[#8c7623] hover:bg-[#8c7623]/5 transition-all"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCheck(product.id, product.name)}
                      className="p-1.5 rounded-lg border border-neutral-100 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-neutral-200 shadow-sm mt-8 text-[13px] font-medium text-neutral-500">
        <div>
          Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trong tổng số {totalItems} sản phẩm
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="h-8 border border-neutral-200 rounded-lg px-2 bg-white text-neutral-900 font-bold outline-none cursor-pointer"
            >
              <option value={12}>12 / trang</option>
              <option value={24}>24 / trang</option>
              <option value={48}>48 / trang</option>
            </select>
          </div>

<<<<<<< HEAD
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 px-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Simple logic for 1 2 3 ... 11 style
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all ${
                        currentPage === page
                          ? "bg-[#8c7623] text-white shadow-md shadow-[#8c7623]/20"
                          : "text-neutral-400 hover:bg-neutral-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-neutral-300 px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

=======
          {/* Sale Filter */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs hover:bg-zinc-100 transition-colors">
              <input 
                type="checkbox" 
                checked={isSaleOnly}
                onChange={(e) => setIsSaleOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-[#8c7623] rounded border-zinc-300 focus:ring-[#8c7623]"
              />
              <span className="text-[9px] font-mono text-rose-500 uppercase tracking-widest font-bold">Đang Săn Sale</span>
            </label>
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
                  
                  {/* Sale overlay */}
                  {product.discount && product.discount > 0 ? (
                    <span className="absolute top-3 right-3 bg-rose-500 shadow-sm border border-rose-600 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white font-mono">
                      Giảm {product.discount}%
                    </span>
                  ) : null}

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
>>>>>>> origin/main
    </div>
  );
};
