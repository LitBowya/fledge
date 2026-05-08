import type { RegistrationRecord } from "#/sections/analytics/types";

function escapeCsvField(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportRegistrationsCsv(rows: RegistrationRecord[]) {
  const header = [
    "ID",
    "Name",
    "Sex",
    "Contact",
    "Denomination",
    "Location",
    "Referral Source",
    "Bus Return Trip",
    "Created At",
  ];

  const body = rows.map((row) => [
    row.id,
    row.name,
    row.sex,
    row.contact,
    row.denomination,
    row.location,
    row.referralSource,
    row.wantsBusReturnTrip ? "Yes" : "No",
    row.createdAt ? new Date(row.createdAt).toISOString() : "",
  ]);

  const content = [header, ...body]
    .map((line) => line.map(escapeCsvField).join(","))
    .join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "registration-analytics.csv";
  a.click();
  URL.revokeObjectURL(url);
}
