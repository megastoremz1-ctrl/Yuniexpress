"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, Send, LogIn } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: (review: any) => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">
        <LogIn size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 mb-3">
          Faça login para deixar a sua avaliação
        </p>
        <Link href="/login">
          <Button variant="outline" size="sm">Entrar</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Selecione uma classificação (1-5 estrelas)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Avaliação publicada!");
        setRating(0);
        setComment("");
        onReviewSubmitted?.(data.review);
      } else {
        toast.error(data.error || "Erro ao publicar avaliação");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Deixe a sua avaliação</h3>

      {/* Star rating */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Classificação *</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              {rating === 1 && "Mau"}
              {rating === 2 && "Razoável"}
              {rating === 3 && "Bom"}
              {rating === 4 && "Muito Bom"}
              {rating === 5 && "Excelente"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Comentário (opcional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte a sua experiência com este produto..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} loading={loading} size="md">
        <Send size={16} className="mr-2" />
        Publicar Avaliação
      </Button>
    </div>
  );
}
