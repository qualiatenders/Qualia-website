/** Rustige paginaovergang bij elke navigatie (CSS-only, respecteert reduced motion). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <main className="page-enter">{children}</main>;
}
