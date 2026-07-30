"use client";

import { useState, useEffect } from "react";
import { Users, Search, Mail, Phone, ShoppingBag, Star, RefreshCw } from "lucide-react";

interface Client {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: string;
  totalOrders: number;
  totalReviews: number;
  totalSpent: number;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClients();
  }, [page]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/clients?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "decimal", minimumFractionDigits: 0 }).format(price);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">{total} clientes registados</p>
        </div>
        <button onClick={fetchClients} className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, email ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
          />
        </div>
      </form>

      {/* Clients List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : clients.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Contacto</th>
                  <th className="px-6 py-3 text-left">Encomendas</th>
                  <th className="px-6 py-3 text-left">Total Gasto</th>
                  <th className="px-6 py-3 text-left">Registado em</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm shrink-0">
                          {client.name?.[0]?.toUpperCase() || client.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {client.name || "Sem nome"}
                          </p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Mail size={10} />
                          {client.email}
                        </p>
                        {client.phone && (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone size={10} />
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-sm">
                          <ShoppingBag size={12} className="text-blue-500" />
                          {client.totalOrders}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Star size={12} className="text-yellow-500" />
                          {client.totalReviews}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {client.totalSpent > 0 ? `${formatPrice(client.totalSpent)} MT` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString("pt-MZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <span className="text-sm text-gray-500">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} de {total}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Anterior</button>
                <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Próxima</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-gray-700">Nenhum cliente encontrado</p>
          <p className="text-sm text-gray-500 mt-1">Os clientes aparecerão aqui quando se registarem</p>
        </div>
      )}
    </div>
  );
}
