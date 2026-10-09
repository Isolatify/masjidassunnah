import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarBlank } from "@phosphor-icons/react";
import { supabase } from "../lib/supabase";
import { nextEventDate, effectiveEntries, recurringLabel, isRecurringEntry } from "../lib/eventTime";
import FormRenderer from "../components/forms/FormRenderer";
import defaultBg from "../assets/photos/hall-arches.jpg";
import "../form.css";

function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventRegisterPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    setEvent(null);
    setForm(null);
    setError(null);
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("events")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();
        if (!alive) return;
        if (err || !data) {
          setError("Event not found");
          return;
        }
        setEvent(data);

        if (data.register_url && !data.form_id) {
          window.location.href = data.register_url;
          return;
        }
        if (!data.form_id) {
          setError("Registration is not open for this event.");
          return;
        }

        const { data: formData } = await supabase
          .from("forms")
          .select("*")
          .eq("id", data.form_id)
          .eq("status", "published")
          .maybeSingle();
        if (!alive) return;
        if (formData) {
          setForm({
            ...formData,
            fields: formData.fields || [],
            settings: formData.settings || {},
          });
        } else {
          setError("This registration form is not open yet. Please check back soon.");
        }
      } catch {
        if (alive) setError("Failed to load registration. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-[16px] text-muted">
          {error || "This event could not be found."}
        </p>
        <Link to={event ? `/events/${event.slug}` : "/events"} className="btn btn-primary">
          Back to {event ? "event" : "events"}
        </Link>
      </div>
    );
  }

  const entries = effectiveEntries(event);
  const nextRes = nextEventDate(entries);
  const primary = nextRes ? entries[nextRes.idx] : entries[0] || null;
  const dateLabel = primary
    ? `${formatDateShort(nextRes ? nextRes.dateStr : primary.date_start)}${
        primary.date_end && primary.date_end !== primary.date_start
          ? ` – ${formatDateShort(primary.date_end)}`
          : ""
      }${
        isRecurringEntry(primary) && recurringLabel(primary)
          ? ` · ${recurringLabel(primary)}`
          : ""
      }`
    : "";

  const coverImage = event.full_image || event.cover_image || event.image_url;

  return (
    <main id="page">
      {/* ── Header ── */}
      <section className="relative isolate flex min-h-[44svh] items-end overflow-hidden bg-primary-deep">
        <img
          src={coverImage || defaultBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/85 via-primary-deep/70 to-primary-deep/95" />

        <div className="container relative z-10 pt-32 pb-12">
          <Link
            to={`/events/${event.slug}`}
            className="rise inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:border-gold hover:text-gold"
            style={{ animationDelay: "0.1s" }}
          >
            <ArrowLeft size={15} weight="bold" /> Back to event
          </Link>

          <span
            className="rise mt-6 block font-heading text-[11px] font-semibold tracking-[0.28em] text-gold uppercase"
            style={{ animationDelay: "0.2s" }}
          >
            Registration
          </span>

          <h1
            className="rise mt-3 max-w-3xl text-[clamp(30px,4.6vw,52px)] leading-[1.06] font-bold tracking-[-0.03em] text-white"
            style={{ animationDelay: "0.3s" }}
          >
            {event.title}
          </h1>

          {dateLabel && (
            <div
              className="rise mt-5 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[14.5px] text-white backdrop-blur-sm"
              style={{ animationDelay: "0.4s" }}
            >
              <CalendarBlank size={16} weight="duotone" className="text-gold" />
              {dateLabel}
            </div>
          )}
        </div>
      </section>

      {!form && (
        <section className="section pt-10 md:pt-14">
          <div className="container max-w-4xl">
            <div className="rounded-3xl border border-line-soft bg-surface px-8 py-12 text-center">
              <p className="text-[15px] text-muted">
                {error || "Registration is not open for this event."}
              </p>
              <Link to={`/events/${event.slug}`} className="btn btn-primary mt-6">
                Back to event
              </Link>
            </div>
          </div>
        </section>
      )}

      {form && <FormRenderer form={form} />}
    </main>
  );
}
