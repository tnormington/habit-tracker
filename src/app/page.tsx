import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Habit Tracker</h1>
      <p className="mt-4 text-muted-foreground">
        Welcome to your habit tracking application.
      </p>

      <Card className="mt-8 max-w-md">
        <CardHeader>
          <CardTitle>Component Demo</CardTitle>
          <CardDescription>
            Demonstrating shadcn/ui components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-input">Sample Input</Label>
            <Input id="demo-input" placeholder="Type something..." />
          </div>
          <div className="flex gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
