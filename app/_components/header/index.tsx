'use client'

type HeaderProps = {
  title: string;
};
export function Header({ title }: HeaderProps) {
  function handlelogout() {
    localStorage.removeItem("token");
    window.location.href = "/Login";
  }
  return (
    <header className=" flex justify-between bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6 shadow-lg">
      <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-md">
        {title}
      </h1>
      <button
        onClick={handlelogout}
        type="submit"
        className=" bg-gradient-to-r p-3 from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Logout
      </button>
    </header>
  );
}
