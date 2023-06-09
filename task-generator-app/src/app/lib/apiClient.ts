import axios from "axios";

export interface TasksResult {
  tasks: string[];
}

export async function generateTasks(
  goal: string,
  numTasks: number
): Promise<TasksResult> {
  const { data } = await axios.post("/api/tasks", {
    goal,
    numTasks,
  });

  return data as TasksResult;
}
