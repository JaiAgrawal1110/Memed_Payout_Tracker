import type { ElementType } from "react";

/** Bold heading where the first part is near-black and the rest is softer grey, like the reference design. */
export function TwoToneHeading({
  strong,
  soft,
  as: Tag = "h1",
  className = "text-3xl sm:text-4xl",
}: {
  strong: string;
  soft: string;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag className={`font-bold tracking-tight ${className}`}>
      <span className="text-neutral-900">{strong}</span> <span className="text-neutral-500">{soft}</span>
    </Tag>
  );
}
