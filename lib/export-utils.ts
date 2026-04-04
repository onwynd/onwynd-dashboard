function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const needsQuote = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export function exportToCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  if (!rows || rows.length === 0) {
    const blob = new Blob([""], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const lines: string[] = [];
  lines.push(headers.join(","));
  for (const row of rows) {
    const line = headers.map((h) => toCsvValue((row as Record<string, unknown>)[h])).join(",");
    lines.push(line);
  }

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(filename: string, headers: string[], rows: Array<Record<string, unknown>>): void {
  const lines: string[] = [];
  lines.push(headers.join(","));
  for (const row of rows) {
    const line = headers.map((h) => toCsvValue((row as Record<string, unknown>)[h])).join(",");
    lines.push(line);
  }
  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
