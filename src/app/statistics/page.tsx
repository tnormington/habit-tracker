import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StatisticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Statistics</h1>
      <p className="mt-2 text-muted-foreground">
        View your habit tracking statistics and insights.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>
              Your overall habit completion percentage
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Longest Streaks</CardTitle>
            <CardDescription>
              Your best habit streaks
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
            <CardDescription>
              How your habits have changed over time
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Consistent</CardTitle>
            <CardDescription>
              Your most reliable habits
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
