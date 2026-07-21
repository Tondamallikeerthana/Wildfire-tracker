export default function FireTable({ events, selectedEvent, onSelect }) {
  return (
    <div className="fire-table-wrap">
      <table className="fire-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Coordinates</th>
            <th>Date</th>
            <th>Categories</th>
            <th>Sources</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 && (
            <tr>
              <td colSpan={5} className="fire-table-empty">No wildfires match the current filters.</td>
            </tr>
          )}
          {events.map((ev) => {
            const geom = ev.geometry && ev.geometry[ev.geometry.length - 1];
            const coords =
              geom && geom.coordinates
                ? `${geom.coordinates[1].toFixed(6)}, ${geom.coordinates[0].toFixed(6)}`
                : "n/a";
            const date = geom && geom.date ? new Date(geom.date).toLocaleString() : "n/a";
            const isSelected = selectedEvent && selectedEvent.id === ev.id;

            return (
              <tr
                key={ev.id}
                className={isSelected ? "fire-row selected" : "fire-row"}
                onClick={() => onSelect(ev)}
              >
                <td>{ev.title}</td>
                <td>{coords}</td>
                <td>{date}</td>
                <td>{ev.categories && ev.categories.map((c) => c.title).join(", ")}</td>
                <td>
                  {ev.sources &&
                    ev.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        {s.id}
                      </a>
                    ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}