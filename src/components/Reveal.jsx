import { useCallback, useRef } from "react";
import useInView from "../hooks/useInView";
import useTilt from "../hooks/useTilt";

export default function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  tilt = false,
  tiltMax = 7,
  ...rest
}) {
  const { ref: viewRef, inView } = useInView();
  const selfRef = useRef(null);

  // One element, two consumers: the IntersectionObserver and the tilt hook.
  const setRef = useCallback(
    (node) => {
      selfRef.current = node;
      viewRef.current = node;
    },
    [viewRef]
  );

  useTilt(selfRef, tilt, tiltMax);

  return (
    <Tag
      ref={setRef}
      className={`reveal ${inView ? "is-visible" : ""} ${tilt ? "tilt" : ""} ${className}`}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
