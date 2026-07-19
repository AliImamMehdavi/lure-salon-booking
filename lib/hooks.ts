import useSWR from "swr";
import { fetchJSON } from "@/lib/fetcher";
import type { Location } from "@/lib/types";

export function useLocations() {
  const { data, ...rest } = useSWR("/api/admin/locations", fetchJSON<{ locations: Location[] }>);
  return { locations: data?.locations ?? [], ...rest };
}
