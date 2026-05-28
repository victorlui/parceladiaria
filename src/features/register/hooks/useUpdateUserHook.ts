import { useMutation } from "@tanstack/react-query";
import { UpdateUserService } from "../service/update-user-service";

export function useUpdateUserHook() {
  return useMutation({
    mutationFn: (request: any) => {
      return UpdateUserService({ request: request.request });
    },
    onSuccess: (data: any) => {
      console.log("update user service", data);

      return data;
    },
  });
}
