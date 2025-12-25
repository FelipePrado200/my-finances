"use client";

type HeaderProps = {
  title: string;
};
export function Header({ title }: HeaderProps) {
  function handlelogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return (
    <header className="flex justify-between items-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-slate-100 p-6 shadow-lg">
      <h1 className="text-3xl font-extrabold tracking-wide">{title}</h1>
      <button
        onClick={handlelogout}
        type="submit"
        className="btn-primary px-4 py-2 font-semibold shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Logout
      </button>
    </header>
  );
}
