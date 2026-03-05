import { useMutation } from "@tanstack/react-query";
import { login } from "../../../api/authApi";
import { useAuth } from "../../../context/AuthContext";

export function useLogin() {
  const { setAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });

  const handleLogin = async (email: string, password: string) => {
    return mutation.mutateAsync({ email, password });
  };

  return {
    handleLogin,
    isLoginPending: mutation.isPending,
    isLoginError: mutation.isError,
    loginError: mutation.error,
    isLoginSuccess: mutation.isSuccess,
  };
}
