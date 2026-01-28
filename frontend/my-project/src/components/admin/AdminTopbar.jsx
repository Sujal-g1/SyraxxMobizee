const AdminTopbar = () => {
  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-[#0f0f0f]">
        Command Center
      </h1>

      <button className="text-sm text-gray-600 hover:text-black">
        Logout
      </button>
    </div>
  );
};
