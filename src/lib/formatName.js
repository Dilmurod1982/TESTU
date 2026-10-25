// "Каримов Дилшод Муратович" -> "Д.М.Каримов"
export function formatShortName({ lastName, firstName, middleName }) {
    const last = (lastName || "").trim();
    const firstInitial = (firstName || "").trim().charAt(0).toUpperCase();
    const middleInitial = (middleName || "").trim().charAt(0).toUpperCase();
  
    const initials = [firstInitial, middleInitial].filter(Boolean).join(".");
    if (!last && !initials) return "—";
    if (!last) return initials;
    if (!initials) return last;
    return `${initials}.${last}`;
  }