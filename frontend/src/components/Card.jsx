import React from "react";

export default function Card({ title, value, subtitle, icon, accent = "forest" }) {
  const accentColors = {
    forest: "bg-forest-green-100 text-forest-green-700",
    sage: "bg-sage-green-100 text-sage-green-700",
    beige: "bg-beige-200 text-beige-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-beige-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-sage-green-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-forest-green-800">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-sage-green-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${accentColors[accent]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}