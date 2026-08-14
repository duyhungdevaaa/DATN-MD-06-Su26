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

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const availableCategories = ["All", ...Array.from(new Set(products.map(p => p.categoryName)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = selectedCategory === "All" || product.categoryName === selectedCategory;
    const matchesStatus = product.status === statusTab;

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

  const handleDeleteCheck = (id: string, name: string) => {
    if (window.confirm(`Xác nhận xóa sản phẩm "${name}"?`)) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Header bar & controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Quản lý kho sản phẩm</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Danh sách toàn bộ sản phẩm đang hoạt động trên hệ thống</p>
        </div>

        <button
          onClick={onAddProductClick}
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex bg-zinc-100 p-1 rounded-lg">
          {Object.values(ProductStatus).map((status) => (
            <button
              key={status}
              onClick={() => setStatusTab(status)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                statusTab === status 
                  ? "bg-white text-zinc-900 shadow-xs" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {status === ProductStatus.ACTIVE ? "Đang bán" : status === ProductStatus.DRAFT ? "Lưu nháp" : "Lưu trữ"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-600">Danh mục:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "Tất cả danh mục" : cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-600">Tồn kho:</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value="All">Tất cả</option>
              <option value="in_stock">Còn hàng (≥ 5)</option>
              <option value="low_stock">Sắp hết hàng (1-4)</option>
              <option value="out_of_stock">Hết hàng (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-700">Không tìm thấy sản phẩm nào</p>
            <p className="text-xs text-zinc-500 mt-1">Thử thay đổi từ khóa hoặc bộ lọc danh mục</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Sản phẩm</th>
                  <th className="py-3.5 px-4">Mã SKU</th>
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4 text-right">Giá niêm yết</th>
                  <th className="py-3.5 px-4 text-center">Tồn kho</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((product) => {
                  let stockBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  let stockText = `Còn ${product.stock}`;
                  if (product.stock === 0) {
                    stockBadge = "bg-rose-50 text-rose-700 border-rose-200";
                    stockText = "Hết hàng";
                  } else if (product.stock < 5) {
                    stockBadge = "bg-amber-50 text-amber-700 border-amber-200";
                    stockText = `Sắp hết: ${product.stock}`;
                  }

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Product image & name */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-8 h-8 rounded-md object-cover border border-zinc-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate max-w-xs text-xs">{product.name}</p>
                            {product.discount ? (
                              <span className="text-[10px] text-rose-600 font-bold">Giảm {product.discount}%</span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-4 font-mono text-xs font-semibold text-zinc-700">
                        {product.sku}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-4 text-xs font-medium text-zinc-700">
                        {product.categoryName}
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-4 text-right font-semibold text-zinc-900 text-xs">
                        {formatVND(product.price)}
                      </td>

                      {/* Stock badge */}
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stockBadge}`}>
                          {stockText}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          product.status === ProductStatus.ACTIVE 
                            ? "bg-zinc-900 text-white" 
                            : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {product.status === ProductStatus.ACTIVE ? "Đang bán" : product.status === ProductStatus.DRAFT ? "Nháp" : "Lưu trữ"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditProductClick(product)}
                            className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                            title="Sửa sản phẩm"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCheck(product.id, product.name)}
                            className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa sản phẩm"
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


