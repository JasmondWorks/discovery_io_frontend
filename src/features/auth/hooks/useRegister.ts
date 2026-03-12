import { useMutation } from "@tanstack/react-query";
import { register } from "../../../api/authApi";
import { useAuth } from "../../../context/AuthContext";

export function useRegister() {
  const { setAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    return mutation.mutateAsync({ name, email, password });
  };

  return {
    handleRegister,
    isRegisterPending: mutation.isPending,
    isRegisterError: mutation.isError,
    registerError: mutation.error,
    isRegisterSuccess: mutation.isSuccess,
  };
}
