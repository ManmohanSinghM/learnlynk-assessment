"use client";

import { createClient } from "@supabase/supabase-js";
import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  QueryClient, 
  QueryClientProvider 
} from "@tanstack/react-query";

// Define the shape of our Task data for TypeScript
interface Task {
  id: string;
  type: string;
  related_id: string;
  due_at: string;
  status: string;
}

// 1. Initialize Supabase
// Make sure you have these variables in your .env.local file!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const queryClient = new QueryClient();

// Wrapper component to provide QueryClient context
export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TasksTable />
    </QueryClientProvider>
  );
}

function TasksTable() {
  const queryClient = useQueryClient();

  // 2. Fetch Tasks Due Today
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks-today"],
    queryFn: async () => {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("tasks")
        .select("id, type, due_at, status, related_id")
        .gte("due_at", `${today}T00:00:00`)
        .lt("due_at", `${today}T23:59:59`);
      
      if (error) throw error;
      return data as Task[];
    },
  });

  // 3. Mutation to Mark Complete
  const mutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // 4. Refresh UI automatically after update
      queryClient.invalidateQueries({ queryKey: ["tasks-today"] });
    },
  });

  if (isLoading) return <div className="p-10">Loading tasks...</div>;
  if (error) return <div className="p-10 text-red-500">Error loading tasks</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Tasks Due Today</h1>
      
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related App ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks?.length === 0 && (
               <tr>
                 <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                   No tasks due today.
                 </td>
               </tr>
            )}
            {tasks?.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap capitalize text-sm font-medium text-gray-900">
                  {task.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                  {task.related_id ? task.related_id.slice(0, 8) + '...' : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(task.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {task.status !== "completed" ? (
                    <button
                      onClick={() => mutation.mutate(task.id)}
                      disabled={mutation.isPending}
                      className="text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 px-3 py-1 rounded-md transition-colors"
                    >
                      {mutation.isPending ? "Updating..." : "Mark Complete"}
                    </button>
                  ) : (
                    <span className="text-gray-400 cursor-not-allowed">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}