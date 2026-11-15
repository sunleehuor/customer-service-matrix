import api from "@/common/libs/api";

export interface ItemData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  detail: (id: string) => [...itemKeys.all, "detail", id] as const,
};

export async function fetchItems(): Promise<ItemData[]> {
  const response = await api.get<ItemData[]>("/items");
  return (response as unknown as ItemData[]) ?? [];
}

export async function fetchItemById(id: string): Promise<ItemData | null> {
  const response = await api.get<ItemData>(`/items/${id}`);
  return (response as unknown as ItemData) ?? null;
}
