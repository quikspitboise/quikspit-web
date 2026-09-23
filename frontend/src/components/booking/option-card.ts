/**
 * Shared look for the selectable cards in the booking steps. The real input
 * is visually hidden inside the label, so focus is shown on the card via
 * :has(:focus-visible).
 */
export function optionCardClass(active: boolean, extra = '') {
  return `relative block cursor-pointer select-none rounded-xl border p-4 transition-[border-color,background-color,transform] duration-200 active:scale-[0.99] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-red-500 ${
    active
      ? 'border-red-500 bg-red-600/[0.08]'
      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
  } ${extra}`
}
