import { useMutation, useQueryClient } from '@tanstack/react-query'
import { baseUrl } from '../../urls/Constant';
import toast from 'react-hot-toast';

const useFollow = () => {
    const queryClient = useQueryClient();

    const { mutate: follow, isPending } = useMutation({
        mutationFn: async (userid) => {
            try {
                const res = await fetch(`${baseUrl}/api/users/followunfollow/${userid}`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }
                return data;
            } catch (error) {
                console.error("Follow Mutation Error:", error);
                throw error;
            }
        },
        onSuccess: async () => {
            try {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["suggesteduser"] }),
                    queryClient.invalidateQueries({ queryKey: ["authUser"] })
                ]);
            } catch (error) {
                console.error("Query Invalidation Error:", error);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return { follow, isPending };
};

export default useFollow;
