interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancy: number;
  monthlyRevenue: number;
}

export default function PropertyCard({
  name,
  address,
  units,
  occupancy,
  monthlyRevenue,
}: PropertyCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-gray-500">{address}</p>
      <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4 text-sm">
        <div>
          <p className="text-gray-500">Units</p>
          <p className="font-medium">{units}</p>
        </div>
        <div>
          <p className="text-gray-500">Occupancy</p>
          <p className="font-medium">{occupancy}%</p>
        </div>
        <div>
          <p className="text-gray-500">Revenue</p>
          <p className="font-medium">R {monthlyRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
