export function mapPriceRow(row) {
  return {
    ...row,
    group: row.group ?? row.group_name ?? "",
  };
}
