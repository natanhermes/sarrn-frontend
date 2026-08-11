export function digitsOnly(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

export function formatCnpj(value?: string | null) {
  const digits = digitsOnly(value);

  if (digits.length !== 14) {
    return value?.trim() || "";
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

export function formatPhoneBR(value?: string | null) {
  let digits = digitsOnly(value);

  if (!digits) {
    return value?.trim() || "";
  }

  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }

  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "+55($1)$2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "+55($1)$2-$3");
  }

  return value?.trim() || "";
}

export function formatPixKeyDisplay(value?: string | null, type?: string | null) {
  const trimmed = value?.trim() || "";
  if (!trimmed) {
    return "";
  }

  const normalizedType = (type ?? "").toLowerCase();
  const digits = digitsOnly(trimmed);

  if (
    normalizedType.includes("cnpj") ||
    (!trimmed.includes("@") && digits.length === 14)
  ) {
    return formatCnpj(trimmed);
  }

  if (
    normalizedType.includes("telefone") ||
    normalizedType.includes("celular") ||
    normalizedType.includes("phone")
  ) {
    return formatPhoneBR(trimmed);
  }

  return trimmed;
}

export function formatCurrencyBRL(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateBR(value?: string | null) {
  if (!value?.trim()) {
    return "—";
  }

  const dateOnly = value.includes("T") ? value.slice(0, 10) : value;
  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("pt-BR");
  }

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function formatDateTimeBR(value?: string | null) {
  if (!value?.trim()) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function toDateInputValue(value?: string | null) {
  if (!value?.trim()) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

export function toDateTimeLocalValue(value?: string | null) {
  if (!value?.trim()) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return `${value.slice(0, 10)}T00:00`;
    }

    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function datetimeLocalToIsoWithOffset(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return trimmed;
    }

    return formatLocalIsoWithOffset(parsed);
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const localDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  if (Number.isNaN(localDate.getTime())) {
    return trimmed;
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${getTimezoneOffsetSuffix(localDate)}`;
}

function formatLocalIsoWithOffset(date: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${getTimezoneOffsetSuffix(date)}`;
}

function getTimezoneOffsetSuffix(date: Date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
}

export function formatLongDateBR(value?: string | null) {
  if (!value?.trim()) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function getCalendarBadgeParts(value?: string | null) {
  if (!value?.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    day: String(parsed.getDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(parsed)
      .replace(".", "")
      .toUpperCase(),
    year: String(parsed.getFullYear()),
  };
}
