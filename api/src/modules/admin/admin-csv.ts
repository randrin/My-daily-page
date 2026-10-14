/** Quoting alone does not stop spreadsheet formula injection. */
export function csvCell(value: string | number | null | undefined): string {
  let text = value == null ? '' : String(value);
  // Control characters are included intentionally to catch hidden formula prefixes.
  // eslint-disable-next-line no-control-regex
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text))
    text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function userExportCsv(
  rows: {
    id: string;
    role: string;
    account: string;
    createdAt: string;
    tasks: number;
  }[],
) {
  return (
    '\uFEFF' +
    [
      ['Identifiant', 'Rôle', 'Compte', 'Inscription (UTC)', 'Nombre de tâches']
        .map(csvCell)
        .join(';'),
      ...rows.map((row) =>
        [row.id, row.role, row.account, row.createdAt, row.tasks]
          .map(csvCell)
          .join(';'),
      ),
    ].join('\r\n')
  );
}
