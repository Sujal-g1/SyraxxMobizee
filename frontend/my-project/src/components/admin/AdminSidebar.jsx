const AdminSidebar = () => {
  return (
    <div className="w-64 bg-[#0f0f0f] text-white flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-10">Mobizee</h1>

      <nav className="space-y-2 text-sm">
        {["Dashboard", "Routes", "Buses", "Wallet", "Cards", "Reports"].map(
          (item) => (
            <div
              key={item}
              className="px-4 py-2 rounded-xl hover:bg-white hover:text-black transition cursor-pointer"
            >
              {item}
            </div>
          )
        )}
      </nav>

      <div className="mt-auto text-xs text-gray-400">
        Transport Authority Panel
      </div>
    </div>
  );
};
