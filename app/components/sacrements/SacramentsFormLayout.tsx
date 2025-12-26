// components/sacraments/SacramentFormLayout.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideCross } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function SacramentFormLayout({ title, description, icon, children, onSubmit, isSubmitting }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-blue-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-3">
            {icon || <LucideCross className="w-8 h-8" />}
            {title}
          </CardTitle>
          <CardDescription className="text-blue-100">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={onSubmit} className="space-y-8">
            {children}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Saving & Generating Certificate..." : "Save Record & Generate Certificate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}