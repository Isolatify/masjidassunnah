import { Users, User, UsersThree, Baby, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const AUDIENCES = [
  {
    icon: Users,
    title: "Brothers",
    text: "Dedicated spaces and programs for the brothers.",
  },
  {
    icon: User,
    title: "Sisters",
    text: "A welcoming space managed by the Sisters Team.",
  },
  {
    icon: UsersThree,
    title: "Youth",
    text: "Islamic programs and activities for ages 10+.",
  },
  {
    icon: Baby,
    title: "Children",
    text: "Nurturing young hearts with Islamic values.",
  },
];

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="mb-14 grid items-end gap-6 md:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Find Your Place</span>
            <h2 className="section-title">What are you looking&nbsp;for?</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="section-sub md:pb-2 md:text-right">
              Wherever you are, there's a place for you here. Choose a path to
              see what's on.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => (
            <Reveal
              key={a.title}
              delay={i * 100}
              tilt
              className="group rounded-2xl border border-line-soft bg-surface p-7 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-mist text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                <a.icon size={26} weight="duotone" />
              </span>
              <h3 className="mt-6 font-heading text-xl font-semibold">
                {a.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                {a.text}
              </p>
              <Link
                to={`/events?audience=${encodeURIComponent(a.title)}`}
                className="mt-4 inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-primary transition-all duration-300 md:opacity-0 md:group-hover:opacity-100"
              >
                See programs <ArrowRight size={13} weight="bold" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
