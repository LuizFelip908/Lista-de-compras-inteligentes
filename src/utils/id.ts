let sequence = 0;

/** Identificador local, não criptográfico; o contador evita colisões no mesmo milissegundo. */
export function createItemId(): string {
  sequence += 1;
  return `item-${Date.now().toString(36)}-${sequence.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
