// Маска: +998-XX-XXX-XX-XX, храним как +998XXXXXXXXX
export function formatPhone(digits) {
    const d = digits.replace(/\D/g, "").slice(0, 9);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 7);
    const p4 = d.slice(7, 9);
    return ["+998", p1, p2, p3, p4].filter(Boolean).join("-");
  }
  
  export function toE164(digits) {
    return "+998" + digits.replace(/\D/g, "").slice(0, 9);
  }
  
  export function isValidUzPhone(digits) {
    return /^\d{9}$/.test(digits.replace(/\D/g, ""));
  }