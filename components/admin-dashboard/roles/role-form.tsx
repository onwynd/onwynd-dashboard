"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { useEffect } from "react";
import { Role, Permission } from "@/lib/api/roles";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  permissions: z.array(z.string()).optional(),
});

interface RoleFormProps {
  initialData?: Role;
  allPermissions: Permission[];
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function RoleForm({ initialData, allPermissions, onSubmit, isLoading, onCancel }: RoleFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        permissions: initialData.permissions?.map((p) => p.name) || [],
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Manager" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Permissions</FormLabel>
          <FormDescription>
            Select the permissions for this role.
          </FormDescription>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <>
                    {allPermissions.map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={permission.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.name)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), permission.name])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value: string) => value !== permission.name
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {permission.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </>
                )}
              />
            </div>
          </ScrollArea>
          <FormMessage />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Role"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
