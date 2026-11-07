const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'email', 'url', 'tel', 'password', 'number'])

/** True when a key event comes from a field the user is typing into, so editor shortcuts should ignore it. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target.tagName === 'TEXTAREA') return true
  return target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type)
}
