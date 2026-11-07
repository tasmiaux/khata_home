type AvatarProps = {
  name: string;
  className?: string;
};

export default function Avatar({ name, className = "" }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif text-xs font-medium text-accent ${className}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
