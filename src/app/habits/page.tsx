import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function HabitsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track your daily habits.
          </p>
        </div>
        <Button>
          <PlusCircle className="size-4" />
          Add Habit
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>No habits yet</CardTitle>
            <CardDescription>
              Create your first habit to start tracking your progress.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
