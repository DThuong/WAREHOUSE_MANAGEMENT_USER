export const removeAccents = (str: string): string => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const fuzzyMatch = (pattern: string, text: string): boolean => {
  if (!pattern) return true;
  if (!text) return false;

  const p = removeAccents(pattern).toLowerCase().trim();
  const t = removeAccents(text).toLowerCase();
  
  // Exact substring match
  if (t.includes(p)) return true;

  // Word by word match (out of order)
  const parts = p.split(/\s+/);
  if (parts.every(part => t.includes(part))) return true;

  return false;
};

export const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text) return text;
  
  // Extract words from keyword
  const words = keyword.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return text;

  // Escape special regex chars
  const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  // Build a regex to match any of the words case-insensitively
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  
  // Highlight with blue padlet colors
  return text.replace(regex, '<mark class="bg-[#E8F4FA] text-[#1C4D8D] border border-[#BDE8F5] font-semibold rounded-sm px-1">$1</mark>');
};
