import { useQuery } from "@tanstack/vue-query";
import {
  fetchItems,
  itemKeys,
  type ItemData,
} from "@/services/item.service";

export function useItemsQuery() {
  return useQuery<ItemData[]>({
    queryKey: itemKeys.lists(),
    queryFn: fetchItems,
    staleTime: 1000 * 60 * 5,
  });
}
