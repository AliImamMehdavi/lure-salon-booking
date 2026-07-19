const PALETTE = [
  ["#f5c842", "#e0a92e"],
  ["#ff6b6b", "#e5484d"],
  ["#00d2d3", "#00a3a4"],
  ["#10b981", "#0d9166"],
  ["#1a1a2e", "#33334d"],
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function colorFor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length;
  return PALETTE[Math.abs(hash) % PALETTE.length] as [string, string];
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const [from, to] = colorFor(name);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials(name)}
    </div>
  );
}
