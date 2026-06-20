export default function DataTable({ columns = [], rows = [], empty = 'No data available' }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows?.length ? rows.map((row) => (
            <tr key={row.id || row.email || JSON.stringify(row)}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
