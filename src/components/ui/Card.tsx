import type { ReactNode } from "react";

import { studioSectionCard } from "@/lib/utils/studioUi";

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Card({ children, className = "", id }: CardProps) {
  return (
    <section id={id} className={`${studioSectionCard} ${className}`}>
      {children}
    </section>
  );
}
