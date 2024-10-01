type ColumnData = {
  name: string;
  width: number;
};

export const MAX_STEPS_PER_RESIZE = 15;

export type ColumnName = "date" | "name" | "size" | "type";

export type Columns = Record<ColumnName, ColumnData>;

export const DEFAULT_COLUMN_ORDER: ColumnName[] = [
  "name",
  "date",
  "type",
  "size",
];

export const DEFAULT_COLUMNS: Columns = {
  date: {
    name: "Date modified",
    width: 140,
  },
  name: {
    name: "Name",
    width: 150,
  },
  size: {
    name: "Size",
    width: 80,
  },
  type: {
    name: "Type",
    width: 82,
  },
};
