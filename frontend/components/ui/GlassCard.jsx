import React from 'react';
import { C } from '../../lib/theme';

export const GlassCard = ({ children, style, hover = true, className = "" }) => (
  <div className={`${hover ? "glass-card-hover" : ""} ${className}`} style={{
    background: C.surface,
    backdropFilter: "blur(32px)",
    borderRadius: 24,
    border: `1px solid ${C.border}`,
    padding: 40,
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    ...style
  }}>
    {children}
  </div>
);
