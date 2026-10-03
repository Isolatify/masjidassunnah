import { Lock } from "@phosphor-icons/react";

/**
 * "Payment secured with Stripe" trust marker with a lock + Stripe logo.
 * tone = "quiet" (inline, muted) | "bar" (full-width strip) | "centered".
 */
export default function StripeBadge({ tone = "quiet", className = "" }) {
  const wrap =
    tone === "bar"
      ? "flex w-full items-center justify-center gap-2.5 rounded-xl border border-line-soft bg-bg px-4 py-3"
      : "inline-flex items-center gap-2";

  return (
    <span className={`${wrap} ${className}`} aria-label="Payment secured with Stripe">
      <Lock size={13} weight="fill" className="shrink-0 text-primary/70" />
      <span className="text-[12.5px] leading-none text-muted">
        Payment secured with{" "}
        <span className="text-[14px] font-semibold leading-none tracking-[-0.03em] text-[#635BFF]">
          stripe
        </span>
      </span>
    </span>
  );
}
