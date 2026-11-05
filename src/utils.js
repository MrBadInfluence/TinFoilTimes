// utils.js — tiny helper functions so we don't repeat ourselves.

// Long leak bodies would make the list huge, so cards show a short preview.
export function shorten(text, max = 110) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

// The database stores dates in ISO format (2026-09-10T08:15:00Z) because
// computers can sort that reliably. People in NZ want DD/MM/YYYY, so we
// convert ONLY at the moment we show it on screen.
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NZ');
}

// "cryptids" -> "Cryptids"
export function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
