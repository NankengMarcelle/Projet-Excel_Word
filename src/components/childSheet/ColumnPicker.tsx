export function ColumnPicker({
  columns,
  selected,
  onChange,
}: {
  columns: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  function toggle(column: string) {
    if (selected.includes(column)) {
      onChange(selected.filter((c) => c !== column));
    } else {
      onChange([...selected, column]);
    }
  }

  return (
    <fieldset className="column-picker">
      <legend>Columns to include</legend>
      {columns.map((column) => (
        <label key={column} className="column-picker-item">
          <input
            type="checkbox"
            checked={selected.includes(column)}
            onChange={() => toggle(column)}
          />
          {column}
        </label>
      ))}
    </fieldset>
  );
}
