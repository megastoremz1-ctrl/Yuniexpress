"use client";

import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { Check, X, Eye, Edit2, Search, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

interface AdminProduct {
  id: string;
  title: string;
  aliexpressId: string | null;
  priceUSD: number;
  priceMZN: number;
  originalPriceMZN: number | null;
  marginPercent: number;
  stock: number;
  status: string;
  featured: boolean;
  createdAt: string;
  images: { url: string }[];
  category: { name: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um produto");
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds, action }),
      });
      const data = await res.json();
      toast.success(data.message);
      setSelectedIds([]);
      fetchProducts();
    } catch (error) {
      toast.error("Erro ao atualizar produtos");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/sync?secret=${process.env.CRON_SECRET}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "products" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Sincronização iniciada com sucesso");
        setTimeout(fetchProducts, 3000);
      } else {
        toast.error("Erro na sincronização");
      }
    } catch (error) {
      toast.error("Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    OUT_OF_STOCK: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
        <Button onClick={handleSync} loading={syncing} variant="secondary">
          <RefreshCw size={16} className="mr-2" />
          Sincronizar AliExpress
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
            placeholder="Pesquisar produtos..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          <option value="">Todos os estados</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
        </select>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleBulkAction("APPROVED")}>
              <Check size={14} className="mr-1" />
              Aprovar ({selectedIds.length})
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleBulkAction("REJECTED")}>
              <X size={14} className="mr-1" />
              Rejeitar
            </Button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(products.map((p) => p.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th className="px-4 py-3 text-left">Preço USD</th>
              <th className="px-4 py-3 text-left">Preço MZN</th>
              <th className="px-4 py-3 text-left">Margem</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, product.id]);
                      } else {
                        setSelectedIds(selectedIds.filter((id) => id !== product.id));
                      }
                    }}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                      {product.images[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                      {product.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {product.category?.name || "-"}
                </td>
                <td className="px-4 py-3 text-sm">${product.priceUSD.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  {formatPrice(product.priceMZN)} MT
                </td>
                <td className="px-4 py-3 text-sm">{product.marginPercent}%</td>
                <td className="px-4 py-3 text-sm">{product.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      statusColors[product.status] || "bg-gray-100"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {product.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleBulkAction("APPROVED")}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Aprovar"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleBulkAction("REJECTED")}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Rejeitar"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Nenhum produto encontrado
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <span className="text-sm text-gray-500">
              Mostrando {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} de {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
