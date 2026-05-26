import Search from "./Search";
import AlertBanner from "./AlertBanner";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
      <div className="flex-1">
        <Search />
      </div>
      <div className="flex items-center gap-3">
        <AlertBanner />
      </div>
    </header>
  );
}
