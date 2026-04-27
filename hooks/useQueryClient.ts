import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";

export function useQueryDataClient() {
  const { setUser, user } = useAuthStore();
  return useQuery({
    queryKey: ["client"],
    queryFn: async () => {
      try {
        const { data } = await api.get("v1/client");
        const newUser = {
          ...user,
          lastLoan: data.data.data.lastLoan,
          teste: "a",
        };
        setUser(newUser);
        return data;
      } catch {
        return null;
      }
    },
    enabled: false,
  });
}
