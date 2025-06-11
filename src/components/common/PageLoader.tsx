
import { Card, CardContent } from "../ui/card";
import LoadingSpinner from "./LoadingSpinner";

interface PageLoaderProps {
  message?: string;
}

const PageLoader = ({ message = "Loading..." }: PageLoaderProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="lg" text={message} className="flex-col gap-4" />
        </CardContent>
      </Card>
    </div>
  );
};

export default PageLoader;
