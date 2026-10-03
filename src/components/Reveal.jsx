import useInView from "../hooks/useInView";

export default function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  ...rest
}) {
  const { ref, inView } = useInView();

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
