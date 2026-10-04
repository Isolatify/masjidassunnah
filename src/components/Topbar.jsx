import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, CaretDown, List, X } from "@phosphor-icons/react";
import { NAV, SITE } from "../config";
import logoColor from "../assets/logos/logo-lockup.png";
import logoWhite from "../assets/logo-white.png";

const toPath = (item) => item.route || "/";

function DesktopLink({ item, active, solid, onNavigate }) {
  const linkCls = `inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-label text-[12px] font-normal uppercase tracking-[0.12em] transition-colors duration-300 ${
    active
      ? solid
        ? "text-primary"
        : "text-white"
      : solid
        ? "text-ink-soft hover:text-primary"
        : "text-white/80 hover:text-white"
  }`;

  if (item.children) {
    return (
      <div className="nav-drop">
        <button type="button" className={linkCls} aria-haspopup="menu">
          <span>{item.label}</span>
          <CaretDown
            size={12}
            weight="bold"
            className="nav-drop__caret opacity-60"
          />
        </button>
        <div className="nav-drop__panel" role="menu">
          <div className="nav-drop__card">
            {item.children.map((child) => {
              const inner = (
                <>
                  <span>{child.label}</span>
                  {child.url && <ArrowUpRight size={13} weight="bold" />}
                </>
              );
              return child.url ? (
                <a
                  key={child.label}
                  href={child.url}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-drop__link"
                  onClick={onNavigate}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  key={child.label}
                  to={toPath(child)}
                  className="nav-drop__link"
                  onClick={onNavigate}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={toPath(item)} className={linkCls} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export default function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const { style } = document.body;
    if (open) {
      const prev = style.overflow;
      style.overflow = "hidden";
      return () => {
        style.overflow = prev;
      };
    }
    return undefined;
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const close = () => setOpen(false);
  const solid = scrolled || open;
  const cta = NAV.find((n) => n.cta);
  const links = NAV.filter((n) => !n.cta);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        solid
          ? "border-line/70 bg-white/85 shadow-[0_16px_40px_-32px_rgba(6,20,15,0.4)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Link to="/" aria-label={SITE.name} className="shrink-0">
          <img
            src={solid ? logoColor : logoWhite}
            alt={`${SITE.name} logo`}
            className={`w-auto transition-all duration-500 ${
              solid ? "h-9" : "h-10"
            }`}
          />
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {links.map((item) => (
            <DesktopLink
              key={item.label}
              item={item}
              active={!item.children && pathname === toPath(item)}
              solid={solid}
              onNavigate={close}
            />
          ))}
          {cta && (
            <Link
              to={toPath(cta)}
              className={`ml-3 inline-flex items-center rounded-full px-6 py-3 font-heading text-[13px] font-semibold tracking-[0.02em] transition-all duration-300 hover:-translate-y-0.5 ${
                solid
                  ? "bg-primary-deep text-white shadow-md hover:bg-primary"
                  : "bg-gold text-primary-deep shadow-[0_10px_30px_-12px_rgba(200,166,93,0.8)] hover:bg-white"
              }`}
            >
              {cta.label}
            </Link>
          )}
        </nav>

        <button
          type="button"
          className={`grid h-11 w-11 place-items-center rounded-full border transition-all duration-300 lg:hidden ${
            solid
              ? "border-line text-ink hover:bg-bg"
              : "border-white/30 text-white hover:bg-white/10"
          }`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X size={22} weight="bold" />
          ) : (
            <List size={22} weight="bold" />
          )}
        </button>
      </div>
    </header>

      {/* ── Mobile sheet (outside <header>: backdrop-filter would make the
             header the containing block and collapse this fixed panel) ── */}
      <div
        className={`fixed inset-x-0 top-[76px] bottom-0 z-40 overflow-y-auto overscroll-contain bg-surface transition-all duration-500 lg:hidden ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav
          className="container flex flex-col gap-1 py-8"
          aria-label="Mobile"
        >
          {NAV.map((item, i) => {
            const style = {
              transitionDelay: open ? `${80 + i * 45}ms` : "0ms",
            };
            const rowCls =
              "mobile-link flex items-center justify-between border-b border-line-soft py-4 font-heading text-xl font-medium text-ink transition-all duration-500";
            const visible = open
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0";

            if (item.children) {
              return (
                <div key={item.label} style={style} className={visible}>
                  <p className="flex items-center gap-1.5 border-b border-line-soft py-4 font-heading text-xl font-medium text-ink">
                    {item.label}
                    <CaretDown size={13} weight="bold" className="mt-1 rotate-[-90deg] opacity-50" />
                  </p>
                  <div className="flex flex-col gap-0.5 pb-3 pt-1">
                    {item.children.map((child) =>
                      child.url ? (
                        <a
                          key={child.label}
                          href={child.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={close}
                          className="flex items-center justify-between py-2 text-[15px] text-muted transition-colors hover:text-primary"
                        >
                          {child.label}
                          <ArrowUpRight size={14} weight="bold" />
                        </a>
                      ) : (
                        <Link
                          key={child.label}
                          to={toPath(child)}
                          onClick={close}
                          className="flex items-center justify-between py-2 text-[15px] text-muted transition-colors hover:text-primary"
                        >
                          {child.label}
                          <ArrowUpRight size={14} weight="bold" />
                        </Link>
                      )
                    )}
                  </div>
                </div>
              );
            }

            if (item.cta) {
              return (
                <div key={item.label} style={style} className={`mt-5 ${visible}`}>
                  <Link
                    to={toPath(item)}
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-full bg-primary-deep px-6 py-4 font-heading text-[15px] font-semibold text-white transition-colors hover:bg-primary"
                  >
                    {item.label}
                  </Link>
                </div>
              );
            }

            return (
              <div key={item.label} style={style} className={visible}>
                <Link to={toPath(item)} onClick={close} className={rowCls}>
                  {item.label}
                  <span className="text-gold">↗</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
