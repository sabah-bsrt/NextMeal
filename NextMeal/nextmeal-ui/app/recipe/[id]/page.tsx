"use client";

import { useParams } from "next/navigation";
import { RecipePage } from "@/components/recipes/RecipePage";

export default function RecipeRoutePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) return null;

  return <RecipePage id={id} />;
}
