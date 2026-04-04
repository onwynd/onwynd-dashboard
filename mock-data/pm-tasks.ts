export interface PMTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate: string;
  points: number;
}

export const pmTasks: PMTask[] = [
  {
    id: "TASK-1234",
    title: "Implement User Authentication",
    status: "in_progress",
    priority: "critical",
    assignee: {
      name: "Alex Dev",
      avatar: "/avatars/06.png",
    },
    dueDate: "2024-03-25T17:00:00Z",
    points: 8,
  },
  {
    id: "TASK-1235",
    title: "Design Dashboard Layout",
    status: "done",
    priority: "high",
    assignee: {
      name: "Sarah Design",
      avatar: "/avatars/07.png",
    },
    dueDate: "2024-03-20T17:00:00Z",
    points: 5,
  },
  {
    id: "TASK-1236",
    title: "Setup CI/CD Pipeline",
    status: "todo",
    priority: "medium",
    assignee: {
      name: "Mike Ops",
      avatar: "/avatars/08.png",
    },
    dueDate: "2024-03-28T17:00:00Z",
    points: 3,
  },
  {
    id: "TASK-1237",
    title: "Write API Documentation",
    status: "review",
    priority: "low",
    assignee: {
      name: "Lisa Tech",
      avatar: "/avatars/09.png",
    },
    dueDate: "2024-03-22T17:00:00Z",
    points: 2,
  },
];
