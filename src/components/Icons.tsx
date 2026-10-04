import type { FindKind } from "../world.ts";

export function IconMine() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  );
}

export function IconMap() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M12 5v14M16 5v14M4 9h16M4 14h16" />
    </svg>
  );
}

export function IconAgent() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  );
}

export function IconPass() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M8 16.5c.8-1.4 2.1-2 4-2s3.2.6 4 2" />
    </svg>
  );
}

export function IconVault() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
  );
}

export function IconSound({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10h3.5L12 6v12l-4.5-4H4v-4z" />
      {off ? <path d="M16 9l5 6M21 9l-5 6" /> : <path d="M16 9.5a3.5 3.5 0 010 5M18.5 7a6.5 6.5 0 010 10" />}
    </svg>
  );
}

export function RobinMark() {
  return (
    <svg className="robin" viewBox="0 0 64 64" aria-hidden="true">
      <circle className="robin-orbit" cx="32" cy="32" r="27" />
      <circle className="robin-halo" cx="32" cy="32" r="16.5" />
      <path className="robin-line" d="M21 43c2-15 13-21 21-16" />
      <path className="robin-line" d="M25 41c9 8 18 4 22-4" />
      <path className="robin-line" d="M33 25c5 1.2 8 6 6.5 10" />
      <path className="robin-beak" d="M42.8 28.6 53 31.2 42.8 33.8z" />
      <path className="robin-tail" d="M19 45c-3.2 5.2-5 9.4-2.6 13" />
      <circle className="robin-eye" cx="36.6" cy="26.4" r="1.15" />
    </svg>
  );
}

export function EthMark() {
  return (
    <svg className="g-svg eth" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.4 19.6 12.15 12 16.05 4.4 12.15 12 1.4Z" />
      <path d="M12 17.15 19.6 13.25 12 22.6 4.4 13.25 12 17.15Z" opacity="0.72" />
    </svg>
  );
}

export function VoidMark() {
  return (
    <svg className="g-svg void" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.2 8.2 15.8 15.8M15.8 8.2 8.2 15.8" />
      <path d="M12 2.2v2.2M12 19.6v2.2M2.2 12h2.2M19.6 12h2.2" />
    </svg>
  );
}

export function Glyph({ kind, factor }: { kind: FindKind; factor?: number }) {
  switch (kind) {
    case "silence":
      return <VoidMark />;
    case "hood":
      return <EthMark />;
    case "nft":
      return (
        <svg className="g-svg gem" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.2 20 9.2 12 21.8 4 9.2 12 2.2Z" />
          <path d="M4 9.2h16M12 2.2 9.2 9.2 12 21.8 14.8 9.2 12 2.2Z" />
        </svg>
      );
    case "multiplier":
      return <b className="g g-h">×{factor ?? 2}</b>;
    case "loot":
      return (
        <svg className="g-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 10.5h14v8.2a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 18.7v-8.2Z" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
          <path d="M12 13.2v3.2" />
        </svg>
      );
    case "bomb":
      return (
        <svg className="g-svg" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="13.2" r="6.2" />
          <path d="M12 7V3.6M9.6 3.6h4.8M16.2 7.4l2.2-2.2" />
        </svg>
      );
    case "event":
      return (
        <svg className="g-svg bolt" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.2 2.2 5.4 13.2h5.6l-1 8.6 7.8-11h-5.6l1-8.6Z" />
        </svg>
      );
    case "key":
      return (
        <svg className="g-svg" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="8" cy="12" r="3.4" />
          <path d="M11.2 12H21M16.6 12v3.2M19.6 12v2.2" />
        </svg>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}
