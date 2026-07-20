import React from "react";
import logoImage from "../assets/logo.png";

/**
 * CrazyGrowMind Studio Brand Logo Component
 * Renders the brand logo image only (text removed - logo image carries the brand name).
 * Supports 'horizontal' layout (best for Navbar) and 'vertical' layout (best for Hero/Footer).
 *
 * @param {object} props
 * @param {'horizontal' | 'vertical'} props.layout - Layout orientation (kept for compatibility; image-only render is the same either way)
 * @param {number} props.height - Height of the logo image
 * @param {string} props.className - Additional class names
 */
export default function Logo({ layout = "horizontal", height = 40, className = "" }) {
  const isVertical = layout === "vertical";

  const logoIcon = (
    <img
      src={logoImage}
      alt="CrazyGrowMind Studio logo"
      height={height}
      style={{ height: `${height}px`, width: "auto", display: "block", objectFit: "contain" }}
      className="logo-svg-icon"
    />
  );

  const wrapperClass = isVertical
    ? `brand-logo-vertical ${className}`
    : `brand-logo-horizontal ${className}`;

  return (
    <div className={wrapperClass} style={{ display: "flex", alignItems: "center", justifyContent: isVertical ? "center" : "flex-start" }}>
      {logoIcon}
    </div>
  );
}

//   if (isVertical) {
//     return (
//       <div className={`brand-logo-vertical ${className}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
//         <div style={{ color: "var(--logo-icon-color, var(--color-black))" }}>
//           {logoIcon}
//         </div>
//         <div className="logo-text-group" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//           <div className="logo-title" style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1.65rem", letterSpacing: "1px", color: "var(--logo-text-color, var(--color-black))", textTransform: "uppercase" }}>
//             CRAZY<span style={{ color: "var(--primary-gold)" }}>GROW</span>MIND
//           </div>
//           <div className="logo-subtitle-wrapper" style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center", gap: "12px", marginTop: "-2px" }}>
//             <span style={{ height: "1px", flex: 1, backgroundColor: "var(--logo-line-color, var(--color-black))", opacity: 0.8 }} />
//             <span className="logo-subtitle" style={{ fontFamily: "var(--font-display)", fontWeight: "600", fontSize: "0.78rem", letterSpacing: "7px", color: "var(--logo-text-color, var(--color-black))", textTransform: "uppercase", paddingLeft: "4px" }}>
//               STUDIO
//             </span>
//             <span style={{ height: "1px", flex: 1, backgroundColor: "var(--logo-line-color, var(--color-black))", opacity: 0.8 }} />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`brand-logo-horizontal ${className}`} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//       <div style={{ color: "var(--logo-icon-color, var(--color-black))", display: "flex", alignItems: "center" }}>
//         {logoIcon}
//       </div>
//       <div className="logo-text-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
//         <div className="logo-title" style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1.15rem", letterSpacing: "0.5px", color: "var(--logo-text-color, var(--color-black))", textTransform: "uppercase", lineHeight: "1.1" }}>
//           CRAZY<span style={{ color: "var(--primary-gold)" }}>GROW</span>MIND
//         </div>
//         <div className="logo-subtitle-wrapper" style={{ display: "flex", alignItems: "center", width: "100%", gap: "6px", marginTop: "1px" }}>
//           <span style={{ height: "1px", flex: 1, backgroundColor: "var(--logo-line-color, var(--color-black))", opacity: 0.7 }} />
//           <span className="logo-subtitle" style={{ fontFamily: "var(--font-display)", fontWeight: "600", fontSize: "0.52rem", letterSpacing: "3.5px", color: "var(--logo-text-color, var(--color-black))", textTransform: "uppercase", paddingLeft: "2px", lineHeight: "1" }}>
//             STUDIO
//           </span>
//           <span style={{ height: "1px", flex: 1, backgroundColor: "var(--logo-line-color, var(--color-black))", opacity: 0.7 }} />
//         </div>
//       </div>
//     </div>
//   );
// }