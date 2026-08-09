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
  MoreHorizontal,
  AlertCircle,
  Package,
  CheckCircle2
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
  const [isSaleOnly, setIsSaleOnly] = useState<boolean>(false);
  const [skuSearch, setSkuSearch] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  const formatPrice = formatVND;

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

    // Sale filter
    const matchesSale = !isSaleOnly || (product.discount && product.discount > 0);

    return matchesGlobalSearch && matchesSkuSearch && matchesCategory && matchesStatus && matchesStock && matchesSale;
  });

  // Sort logic (simplified)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "price-asc") return a.price - b.price;
    if (sortOrder === "price-desc") return b.price - a.price;
    return 0;
  });

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

          <div className="flex items-center gap-6">
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

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Trong kho:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] focus:outline-none focus:bg-white font-sans text-zinc-700 font-medium"
              >
                <option value="All">Tất cả số lượng</option>
                <option value="in_stock">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
          </div>
        </div>

        {/* SKU Search & Sort */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              placeholder="Tìm SKU..."
              className="h-9 w-40 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs font-sans focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] outline-none transition-all bg-zinc-50"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 focus:ring-4 focus:ring-[#8c7623]/10 focus:border-[#8c7623] outline-none cursor-pointer bg-zinc-50"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/60 p-16 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="font-sans text-lg text-zinc-800 font-medium">Không tìm thấy sản phẩm nào</h3>
          <p className="font-sans text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Vui lòng thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc danh mục/trạng thái hàng hóa.
          </p>
          <button 
            onClick={() => {
              setSelectedCategory("All");
              setStockFilter("All");
              setStatusTab(ProductStatus.ACTIVE);
              setSkuSearch("");
            }}
            className="mt-6 text-xs text-[#8c7623] font-bold tracking-wider uppercase hover:underline"
          >
            Reset bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
              // Determine stock pill styles
              let stockPillStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";
              let stockLabel = `Còn hàng: ${product.stock}`;
              let StockIcon = CheckCircle2;

              if (product.stock === 0) {
                stockPillStyle = "bg-rose-50 text-rose-700 border-rose-100";
                stockLabel = "Hết hàng hoàn toàn";
                StockIcon = Package;
              } else if (product.stock < 5) {
                stockPillStyle = "bg-amber-50 text-amber-700 border-amber-100";
                stockLabel = `Sắp hết hàng: còn ${product.stock}`;
                StockIcon = AlertCircle;
              }

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-[#8c7623]/40 hover:shadow-md transition-all duration-350"
                >
                  {/* Product Frame and Image */}
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
                      <h4 className="font-sans text-base text-zinc-900 font-bold tracking-tight line-clamp-1">
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

          {/* Pagination & Global Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-white px-6 py-4 rounded-2xl border border-zinc-200/60 shadow-sm mt-8 gap-4">
            <div className="text-[12px] font-sans font-medium text-zinc-500">
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} trong tổng số {totalItems} sản phẩm
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hiển thị:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="h-8 border border-zinc-200 rounded-lg px-2 bg-zinc-50 text-zinc-900 font-bold outline-none cursor-pointer text-xs"
                >
                  <option value={12}>12 / trang</option>
                  <option value={24}>24 / trang</option>
                  <option value={48}>48 / trang</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs hover:bg-zinc-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={isSaleOnly}
                    onChange={(e) => setIsSaleOnly(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#8c7623] rounded border-zinc-300 focus:ring-[#8c7623]"
                  />
                  <span className="text-[9px] font-sans text-rose-500 uppercase tracking-widest font-bold">Đang Săn Sale</span>
                </label>
              </div>
            </div>

            <button
              onClick={onAddProductClick}
              className="flex items-center justify-center gap-2 bg-zinc-900 text-white hover:bg-[#8c7623] px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase font-sans transition-all duration-200 shadow-md shadow-zinc-900/5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Khai báo sản phẩm mới
            </button>
          </div>
        </>
      )}
    </div>
  );
};
