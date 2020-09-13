export type Processes = Array<Process>;

export type ProcessAction = {
  id?: string;
  process?: Process;
  updates?: Partial<Process>;
};
