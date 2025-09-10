# Create UI Component

Context:

- Component type: {{input:type|card|form|list|modal|dashboard}}
- Feature area: {{input:area|user|doc|community|job|course}}
- Client component: {{input:client|yes|no}}

Requirements:

- Follow shadcn/ui and Radix UI patterns
- Ensure WCAG 2.1 AA accessibility
- Implement responsive design with Tailwind
- Add proper TypeScript typing
- Include appropriate loading/error states
- Use established component organization patterns

Implementation guide:

1. Create component in appropriate directory (components/[feature]/)
2. Use shadcn/ui primitives when possible
3. Add 'use client' directive only if interactivity is needed
4. Implement proper props interface
5. Add appropriate aria attributes for accessibility

Component template:

```tsx
// components/[feature]/[component-name].tsx
import { cn } from "@/lib/utils";

// Define component props with TypeScript
interface ComponentProps {
  // Add your props here
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Component description
 */
export function ComponentName({
  title,
  description,
  className,
  children,
}: ComponentProps) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-2", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
```

Client component template:

```tsx
"use client";

// components/[feature]/[component-name].tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InteractiveComponentProps {
  initialValue: string;
  onAction: (value: string) => void;
  className?: string;
}

/**
 * Interactive component description
 */
export function InteractiveComponent({
  initialValue,
  onAction,
  className,
}: InteractiveComponentProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className={cn("rounded-lg border p-4 space-y-4", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
        aria-label="Input description"
      />

      <Button onClick={() => onAction(value)} aria-label="Action description">
        Submit
      </Button>
    </div>
  );
}
```

Form component example:

```tsx
"use client";

// components/[feature]/[name]-form.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createEntity } from "@/actions/entity/create-entity";

// Form schema using Zod
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

// Define form values type
type FormValues = z.infer<typeof formSchema>;

// Props
interface EntityFormProps {
  defaultValues?: Partial<FormValues>;
  entityId?: string;
}

export function EntityForm({ defaultValues, entityId }: EntityFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
    },
  });

  // Form submission handler
  async function onSubmit(values: FormValues) {
    setIsPending(true);

    try {
      const result = await createEntity({
        ...values,
        id: entityId,
      });

      if (result.ok) {
        toast.success("Entity saved successfully");
        router.push(`/entities/${result.data.id}`);
      } else {
        toast.error("Failed to save entity");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Entity"}
        </Button>
      </form>
    </Form>
  );
}
```
