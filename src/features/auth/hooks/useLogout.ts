import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../../api/authApi";
import { useAuth } from "../../../context/AuthContext";

export function useLogout() {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      // clearAuth wipes the in-memory token regardless of API success/failure
      clearAuth();
      navigate("/login", { replace: true });
    },
  });

  const handleLogout = () => {
    mutation.mutate();
  };

  return {
    handleLogout,
    isLogoutPending: mutation.isPending,
  };
}
