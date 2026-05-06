import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";

export function useQueryDataClient() {
  return useQuery({
    queryKey: ["client"],
    queryFn: async () => {
      try {
        const { data } = await api.get("v1/client");

        const authStore = useAuthStore.getState();
        const currentUser = authStore.user;

        const newUser = currentUser
          ? { ...currentUser, lastLoan: data.data.data.lastLoan }
          : ({ lastLoan: data.data.data.lastLoan } as any);

        authStore.setUser(newUser);

        return data;
      } catch {
        return null;
      }
    },
    enabled: false,
  });
}
