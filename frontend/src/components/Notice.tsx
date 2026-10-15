import type { ReactNode } from "react";
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from "@/components/tailgrids/core/alert";

export function Notice({
  status,
  title,
  children,
}: {
  status: "success" | "error" | "info" | "warning";
  title: string;
  children?: ReactNode;
}) {
  return (
    <Alert status={status}>
      <AlertIndicator />
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        {children && <AlertDescription>{children}</AlertDescription>}
      </AlertContent>
    </Alert>
  );
}
