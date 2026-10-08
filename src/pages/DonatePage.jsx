import { useState } from "react";
import {
  Heart,
  CaretRight,
  CheckCircle,
  EnvelopeSimple,
  Copy,
} from "@phosphor-icons/react";
import { useSearchParams } from "react-router-dom";
import { SITE } from "../config";
import { useSettings } from "../lib/siteSettings";
import { ADMIN_URL } from "../lib/adminUrl";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import StripeBadge from "../components/StripeBadge";
import terminalPhoto from "../assets/photos/donation-terminal.jpg";

const AMOUNTS = [25, 50, 100, 250];

const STATS = [
  { num: "20+", label: "Years" },
  { num: "1000s", label: "Worshippers" },
  { num: "7", label: "Days a week" },
];

// Fund selection was removed from the flow — donations land in the general fund.
const FUND_ID = "general";

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
      {children}
    </p>
  );
}

export default function DonatePage() {
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [pledger, setPledger] = useState({ name: "", email: "" });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [copied, setCopied] = useState("");
  const [params, setParams] = useSearchParams();

  const settings = useSettings();
  const donations = settings.donations ?? {};
  const siteEmail = settings.site?.email || SITE.email;
  const currency = (settings.site?.currency || "AUD").toLowerCase();
  const showBank = donations.showBank !== false;
  const showCard = donations.showCard !== false;
  const minAmount = Number(donations.minAmount) > 0 ? Number(donations.minAmount) : 1;
  const goal = Number(donations.goal) || 0;
  const donationsEnabled = donations.enabled !== false;

  const paid = params.get("paid");
  const value = custom ? Number(custom) : amount;
  const tooSmall = Number.isFinite(value) && value > 0 && value < minAmount;
  const detailsMissing = !pledger.name.trim() || !/^\S+@\S+\.\S+$/.test(pledger.email.trim());

  const bank = [
    { label: "Account name", value: donations.accountName || "Sunnah Foundation Australia" },
    { label: "BSB", value: donations.bsb || "611 100" },
    { label: "Account number", value: donations.account || "401328" },
    ...(donations.abn ? [{ label: "ABN", value: donations.abn }] : []),
  ];

  async function copyValue(label, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  const payByCard = async () => {
    if (!ADMIN_URL) {
      setPayError("Card payments are unavailable right now — please use bank transfer.");
      return;
    }
    if (tooSmall) {
      setPayError(`The minimum donation is $${minAmount}.`);
      return;
    }
    if (detailsMissing) {
      setPayError("Please add your name and a valid email address first.");
      return;
    }
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch(`${ADMIN_URL}/api/donations/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: value,
          currency,
          fund: FUND_ID,
          name: pledger.name,
          email: pledger.email,
          origin: window.location.origin,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not start the payment");
      window.location.href = json.url;
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Could not start the payment");
      setPaying(false);
    }
  };

  const reset = () => {
    setPayError("");
    setParams({});
  };

  return (
    <>
      <PageHero
        bg={terminalPhoto}
        eyebrow="Support Your Centre"
        title="Take a share of the reward."
        sub="Masjid As Sunnah is the home of Sydney's Muslim community — privileged to cater for the thousands of people who walk through our doors every week. Your donation makes that possible."
      />

      <main id="page">
        <section className="section">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              {/* ── Editorial column ── */}
              <div className="lg:col-span-6 xl:col-span-5">
                <Reveal>
                  <span className="eyebrow">Why It Matters</span>
                  <h2 className="section-title">
                    Every dollar keeps the doors open.
                  </h2>
                  <p className="lede mt-6">
                    Every dollar you give goes towards keeping the masjid
                    running — the lights, the cooling, the classes, the
                    community.
                  </p>
                  <p className="mt-5 text-[15.5px] leading-[1.75] text-ink-soft">
                    Sadaqah Jariyah that continues to benefit long after you've
                    given — a house of Allah that stands for the next generation
                    as it has for more than twenty years.
                  </p>
                </Reveal>

                <Reveal delay={120}>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {STATS.map((s) => (
                      <span
                        key={s.label}
                        className="inline-flex items-baseline gap-2 rounded-full border border-line bg-surface px-5 py-2.5"
                      >
                        <strong className="font-display text-lg font-bold text-primary">
                          {s.num}
                        </strong>
                        <span className="text-[13px] text-muted">
                          {s.label}
                        </span>
                      </span>
                    ))}
                  </div>
                </Reveal>

                <Reveal delay={180}>
                  <ul className="mt-10 flex flex-col gap-4 border-t border-line-soft pt-8">
                    {[
                      "Card payments handled securely by Stripe",
                      "Bank transfer details below — use your name as the reference",
                      "Receipts issued by the office, in sha Allah",
                    ].map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-soft"
                      >
                        <CheckCircle
                          size={17}
                          weight="fill"
                          className="mt-1 shrink-0 text-primary"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              {/* ── Donation form ── */}
              <div className="lg:col-span-6 xl:col-span-7">
                <Reveal delay={140}>
                  <div className="rounded-2xl border border-line-soft bg-surface p-7 shadow-md lg:sticky lg:top-28 md:p-9">
                    <div className="flex items-start gap-4 border-b border-line-soft pb-6">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white">
                        <Heart size={22} weight="duotone" />
                      </span>
                      <div>
                        <h3 className="font-heading text-xl font-semibold">
                          Support our masjid
                        </h3>
                        <p className="mt-1 text-[14px] text-muted">
                          Choose an amount, add your details, then pay by card
                          or bank transfer.
                        </p>
                      </div>
                    </div>

                    <StripeBadge tone="bar" className="mt-5" />

                    {paid === "1" ? (
                      <div className="mt-8 rounded-xl border border-primary-mist bg-primary-mist/40 p-7 text-center">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
                          <CheckCircle size={26} weight="duotone" />
                        </span>
                        <h4 className="mt-5 font-heading text-lg font-semibold">
                          JazakAllah Khair!
                        </h4>
                        <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
                          Your payment went through safely. A receipt is on its
                          way to your inbox, in sha Allah — thank you for
                          supporting the masjid.
                        </p>
                        <button
                          type="button"
                          className="btn btn-secondary mt-6"
                          onClick={reset}
                        >
                          Make another donation
                        </button>
                      </div>
                    ) : donationsEnabled ? (
                      <div>
                        {goal > 0 && (
                          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-line-soft bg-bg px-5 py-4">
                            <p className="text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                              Current fundraising goal
                            </p>
                            <p className="font-display text-xl font-bold text-primary">
                              ${goal.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {paid === "0" && (
                          <p className="mt-6 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-[13.5px] text-ink-soft">
                            The payment was cancelled — no charge was made. You
                            can try again below.
                          </p>
                        )}

                        {/* amount */}
                        <div className="mt-7">
                          <SectionLabel>How much would you like to give?</SectionLabel>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {AMOUNTS.map((a) => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => {
                                  setAmount(a);
                                  setCustom("");
                                }}
                                className={`rounded-xl border py-4 font-display text-xl font-bold transition-all duration-300 ${
                                  amount === a && !custom
                                    ? "border-primary bg-primary text-white"
                                    : "border-line-soft bg-surface text-ink hover:border-primary-mist"
                                }`}
                              >
                                ${a}
                              </button>
                            ))}
                          </div>

                          <label className="mt-4 flex items-center gap-4 rounded-xl border border-line-soft bg-bg px-5 py-4">
                            <span className="text-[13px] text-muted">
                              or enter your own
                            </span>
                            <span className="ml-auto flex items-center gap-1">
                              <span className="font-display text-xl font-bold text-muted">
                                $
                              </span>
                              <input
                                type="number"
                                min={minAmount}
                                placeholder="0"
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                                aria-label="Custom donation amount"
                                className="w-24 border-0 bg-transparent text-right font-display text-xl font-bold text-ink outline-none placeholder:text-muted/60"
                              />
                            </span>
                          </label>
                        </div>

                        {/* details */}
                        <div className="mt-8">
                          <SectionLabel>Your details</SectionLabel>
                          <StripeBadge tone="quiet" className="-mt-1 mb-4" />
                          <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1 block text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                                Your Name
                              </span>
                              <input
                                type="text"
                                placeholder="Full name"
                                value={pledger.name}
                                onChange={(e) =>
                                  setPledger({ ...pledger, name: e.target.value })
                                }
                                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                                className="w-full border-0 border-b border-primary/25 bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                                Your Email
                              </span>
                              <input
                                type="email"
                                placeholder="you@example.com"
                                value={pledger.email}
                                onChange={(e) =>
                                  setPledger({ ...pledger, email: e.target.value })
                                }
                                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                                className="w-full border-0 border-b border-primary/25 bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary"
                              />
                            </label>
                          </div>
                        </div>

                        {/* payment */}
                        <div className="mt-8">
                          <SectionLabel>Payment</SectionLabel>
                          <div className="flex flex-wrap items-center gap-3">
                            {showCard && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={paying || tooSmall}
                                onClick={payByCard}
                              >
                                {paying ? (
                                  "Opening…"
                                ) : (
                                  <>
                                    Pay ${value || 0} by card
                                    <CaretRight size={15} weight="bold" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {showCard && <StripeBadge tone="quiet" className="mt-3" />}

                          {tooSmall && (
                            <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-[13.5px] text-ink-soft">
                              The minimum donation is ${minAmount}.
                            </p>
                          )}

                          {payError && (
                            <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-[13.5px] text-danger">
                              {payError}
                            </p>
                          )}
                        </div>

                        {showBank && (
                          <div className="mt-7 rounded-2xl border border-line-soft bg-bg p-5">
                            <p className="text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                              Or pay by bank transfer
                            </p>
                            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                              {bank.map((row) => (
                                <div
                                  key={row.label}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-line-soft bg-surface px-4 py-3"
                                >
                                  <div>
                                    <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">
                                      {row.label}
                                    </dt>
                                    <dd className="mt-0.5 font-display text-[16px] font-bold text-ink">
                                      {row.value}
                                    </dd>
                                  </div>
                                  <button
                                    type="button"
                                    aria-label={`Copy ${row.label}`}
                                    onClick={() => copyValue(row.label, row.value)}
                                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-primary hover:text-primary"
                                  >
                                    {copied === row.label ? (
                                      <CheckCircle size={15} weight="fill" />
                                    ) : (
                                      <Copy size={15} />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </dl>
                            <p className="mt-3 text-[13px] text-muted">
                              Use your name as the payment reference so we can
                              match your donation.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-8 rounded-xl border border-line-soft bg-surface p-7 text-center">
                        <h4 className="font-heading text-lg font-semibold">
                          Donations are temporarily paused
                        </h4>
                        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
                          Online giving is switched off right now. Please check
                          back soon, or email{" "}
                          <strong className="font-medium">{siteEmail}</strong>{" "}
                          and we will help you directly.
                        </p>
                        <a
                          className="btn btn-secondary mt-6"
                          href={`mailto:${siteEmail}`}
                        >
                          <EnvelopeSimple size={16} weight="bold" /> Contact the
                          office
                        </a>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonial ── */}
        <section className="section section-pattern border-t border-line-soft bg-surface">
          <div className="container">
            <Reveal className="mx-auto max-w-3xl text-center">
              <span className="mx-auto font-display text-6xl leading-none text-gold">
                &ldquo;
              </span>
              <blockquote className="font-display text-[clamp(21px,2.6vw,30px)] leading-[1.4] font-bold tracking-[-0.015em] text-ink">
                Our children look forward to Madrasah every weekend, coming home
                with new verses memorised and close friendships. Masjid As
                Sunnah provides an exceptional environment that does more than
                teach — it truly helps shape our children's Islamic identity,
                in sha'Allah.
              </blockquote>
              <div className="mx-auto mt-7 h-px w-16 bg-line" />
              <cite className="mt-5 block text-[14px] font-medium text-primary not-italic">
                A Madrasah parent
              </cite>
              <p className="mt-1 text-[12.5px] tracking-[0.14em] text-muted uppercase">
                Masjid As Sunnah &middot; Lakemba Community
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
