import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h1 className="text-3xl font-bold mb-4">Home Page</h1>
      <p>Welcome to the Camair Dashboard!</p>
      <Button className="mt-4" onClick={() => navigate("/dashboard/air-quality")}>
        Click Me
      </Button>
    </div>
  );
}
