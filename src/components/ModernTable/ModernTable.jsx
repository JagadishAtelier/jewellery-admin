import "./ModernTable.css"; 
function ModernTable({ headers, rows }) {
  return (
    <div className="table-responsive modern-table-wrapper">
      <table className="table table-hover table-bordered align-middle modern-table">
        <thead className="table-header">
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cols, i) => (
            <tr key={i}>
              {cols.map((col, j) => <td key={j}>{col}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ModernTable;
