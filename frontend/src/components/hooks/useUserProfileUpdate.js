import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../../urls/Constant";

const useUserProfileUpdate = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateprofile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch(`${baseUrl}/api/users/updateuser`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Fix: No extra object wrapping
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");

      // Fix: Call invalidateQueries separately
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(error.message || "Profile update failed");
    },
  });

  return { updateprofile, isUpdatingProfile };
};

export default useUserProfileUpdate;
