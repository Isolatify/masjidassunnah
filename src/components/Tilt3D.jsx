import { useRef } from "react";
import useTilt from "../hooks/useTilt";

/**
 * Standalone 3D tilt wrapper. For cards that should also scroll-reveal,
 * put `tilt` on <Reveal> instead.
 */
export default function Tilt3D({
  as: Tag = "div",
  max = 7,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);
  useTilt(ref, true, max);

  return (
    <Tag ref={ref} className={`tilt ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
