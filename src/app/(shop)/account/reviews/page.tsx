"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, ChevronRight, MessageSquare } from "lucide-react";

interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  createdAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    image: string | null;
  };
}

export default function UserReviewsPage() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchReviews();
  }, [status]);

  if (status === "unauthenticated") redirect("/login");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews/mine");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/account" className="hover:text-yellow-600">Conta</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">Minhas Avaliações</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Minhas Avaliações</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma avaliação</h2>
          <p className="text-gray-500 mb-4">Ainda não avaliou nenhum produto.</p>
          <Link href="/account/orders" className="text-yellow-600 hover:underline font-medium">
            Ver encomendas para avaliar
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border p-4">
              <div className="flex gap-4">
                {/* Product image */}
                <Link href={`/product/${review.product.slug}`} className="shrink-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {review.product.image && (
                      <img
                        src={review.product.image}
                        alt={review.product.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  {/* Product title */}
                  <Link
                    href={`/product/${review.product.slug}`}
                    className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-yellow-600"
                  >
                    {review.product.title}
                  </Link>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    {review.verified && (
                      <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        Compra verificada
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.comment}</p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString("pt-MZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
