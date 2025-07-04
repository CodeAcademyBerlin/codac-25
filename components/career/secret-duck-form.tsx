"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SecretDuckForm() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handlePasswordCheck = () => {
    if (password === "quack") {
      toast.success("Correct password! Welcome to the duck side.");
      router.push("/career/ducks/upload");
    } else {
      toast.error("Incorrect Password", {
        description: "That's not the secret password.",
      });
      setPassword("");
    }
  };

  return (
    <div className="mt-16 border-t pt-8">
      <div className="max-w-md mx-auto text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Psst... looking for something else?
        </p>
        <div className="flex gap-2 justify-center">
          <Input
            type="password"
            placeholder="Enter secret password..."
            className="max-w-xs bg-background"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handlePasswordCheck();
              }
            }}
          />
          <Button onClick={handlePasswordCheck} variant="outline">
            Unlock
          </Button>
        </div>
      </div>
    </div>
  );
}
