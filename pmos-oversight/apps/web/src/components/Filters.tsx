export default function Filters() {
  return (
    <div className="flex flex-wrap gap-3">
      <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
        <option>All Properties</option>
      </select>
      <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
        <option>All Statuses</option>
      </select>
    </div>
  );
}
