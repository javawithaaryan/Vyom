import React from 'react';

/**
 * Reusable Card component adhering to the design system.
 * Props:
 *  - title: optional string or element for the card header
 *  - children: card content
 *  - className: additional Tailwind or custom classes
 */
export default function Card({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`.trim()}>
      {title && (
        <div className="card-header mb-4">
          {typeof title === 'string' ? <h3 className="text-lg font-bold text-var(--color-text)">{title}</h3> : title}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
