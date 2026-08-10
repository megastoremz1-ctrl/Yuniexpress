"use client";

import { useState } from "react";

export default function NewCampaignPage() {

  const [form, setForm] = useState({

    title: "",

    description: "",

    buttonText: "Comprar Agora",

    buttonLink: "",

    startDate: "",

    endDate: "",

    banner: true,

    popup: true,

    email: true,

    push: false,

  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {

    const { name, value } = e.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));

  }

  return (

    <div className="max-w-4xl">

      <h1 className="text-3xl font-bold mb-8">
        Nova Campanha
      </h1>

      <div className="space-y-6 rounded-2xl border bg-white p-8">

        <div>

          <label className="font-medium">
            Título
          </label>

          <input
            className="mt-2 w-full rounded-xl border p-3"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

        </div>

        <div>

          <label className="font-medium">
            Descrição
          </label>

          <textarea
            className="mt-2 h-32 w-full rounded-xl border p-3"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <label className="font-medium">
              Texto do Botão
            </label>

            <input
              className="mt-2 w-full rounded-xl border p-3"
              name="buttonText"
              value={form.buttonText}
              onChange={handleChange}
            />

          </div>

          <div>

            <label className="font-medium">
              Link
            </label>

            <input
              className="mt-2 w-full rounded-xl border p-3"
              name="buttonLink"
              value={form.buttonLink}
              onChange={handleChange}
            />

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <label className="font-medium">
              Data início
            </label>

            <input
              type="date"
              className="mt-2 w-full rounded-xl border p-3"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />

          </div>

          <div>

            <label className="font-medium">
              Data fim
            </label>

            <input
              type="date"
              className="mt-2 w-full rounded-xl border p-3"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />

          </div>

        </div>

        <div className="space-y-3">

          <label className="flex gap-3">
            <input type="checkbox" defaultChecked />
            Mostrar Banner
          </label>

          <label className="flex gap-3">
            <input type="checkbox" defaultChecked />
            Mostrar Popup
          </label>

          <label className="flex gap-3">
            <input type="checkbox" defaultChecked />
            Enviar Email
          </label>

          <label className="flex gap-3">
            <input type="checkbox" />
            Push Notification
          </label>

        </div>

        <button
          className="rounded-xl bg-yellow-500 px-8 py-3 font-semibold hover:bg-yellow-400"
        >
          Publicar Campanha
        </button>

      </div>

    </div>

  );

}