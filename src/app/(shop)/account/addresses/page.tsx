"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AddressesPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", province: "", city: "", address: "" });

  useEffect(() => {
    fetch("/api/user/address").then(r => r.json()).then(d => {
      if (d.address && d.address.phone) setAddresses([d.address]);
    }).catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Endereços de Entrega</h1>

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border">
              <p className="font-medium text-gray-900">{addr.name}</p>
              <p className="text-sm text-gray-600">{addr.phone}</p>
              <p className="text-sm text-gray-500">{addr.address}, {addr.city}, {addr.province}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border">
          <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">Nenhum endereço guardado</p>
          <p className="text-sm text-gray-400 mt-1">O seu endereço será guardado após a primeira compra</p>
        </div>
      )}
    </div>
  );
}
