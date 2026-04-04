"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Breadcrumb = ({ className, ...props }: React.ComponentProps<"nav">) => {
  return (
    <nav aria-label="breadcrumb" className={cn("flex items-center", className)} {...props} />
  );
};

const BreadcrumbList = ({ className, ...props }: React.ComponentProps<"ol">) => {
  return <ol className={cn("flex items-center gap-2", className)} {...props} />;
};

const BreadcrumbItem = ({ className, ...props }: React.ComponentProps<"li">) => {
  return <li className={cn("inline-flex items-center", className)} {...props} />;
};

type BreadcrumbLinkProps = React.ComponentProps<typeof Link> & {
  className?: string;
};

const BreadcrumbLink = ({ className, ...props }: BreadcrumbLinkProps) => {
  return (
    <Link className={cn("text-sm text-muted-foreground hover:text-foreground", className)} {...props} />
  );
};

const BreadcrumbPage = ({ className, ...props }: React.ComponentProps<"span">) => {
  return (
    <span aria-current="page" className={cn("text-sm font-medium", className)} {...props} />
  );
};

const BreadcrumbSeparator = ({ className, ...props }: React.ComponentProps<"li">) => {
  return (
    <li role="presentation" className={cn("mx-1 text-muted-foreground", className)} {...props}>
      /
    </li>
  );
};

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator };

