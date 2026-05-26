import { AlertTriangle } from "lucide-react";

export default function AlertBanner() {
  return (
    <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
      <AlertTriangle className="h-5 w-5" />
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        3
      </span>
    </button>
  );
}
