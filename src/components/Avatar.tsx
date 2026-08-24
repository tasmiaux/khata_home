type AvatarProps = {
  name: string;
  className?: string;
};

export default function Avatar({ name, className = "" }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border font-serif text-xs text-accent ${className}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
