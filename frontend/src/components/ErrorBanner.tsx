import { describeError } from "@/lib/api";
import { Notice } from "./Notice";

export function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;
  const { message, details } = describeError(error);
  return (
    <Notice status="error" title={message}>
      {details.length > 0 && (
        <ul className="list-disc pl-4">
          {details.map((d, i) => (
            <li key={i}>{d.message}</li>
          ))}
        </ul>
      )}
    </Notice>
  );
}
