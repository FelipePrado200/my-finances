type cartsProps = {
  receitas: number;
  despesas: number;
  saldo: number;
};
export function Carts({ receitas, despesas, saldo }: cartsProps) {
  return (
    <section className="mt-5 p-4 md:p-6 rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
        <div className="flex flex-col items-center space-y-3 md:space-y-4">
          <div className="glass p-3 md:p-4 rounded-xl w-full">
            <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2 truncate text-slate-100">
              Receitas
            </h2>
            <p className="text-xl md:text-2xl font-semibold truncate text-green-300">
              R$ {receitas}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></div>
            <span className="text-xs md:text-sm text-slate-300">Entradas</span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3 md:space-y-4">
          <div className="glass p-3 md:p-4 rounded-xl w-full">
            <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2 truncate text-slate-100">
              Despesas
            </h2>
            <p className="text-xl md:text-2xl font-semibold truncate text-red-300">
              R$ {despesas}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full"></div>
            <span className="text-xs md:text-sm text-slate-300">Saídas</span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3 md:space-y-4">
          <div className="glass p-3 md:p-4 rounded-xl w-full">
            <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2 truncate text-slate-100">
              Saldo
            </h2>
            <p
              className={`text-xl md:text-2xl font-bold truncate ${
                saldo >= 0 ? "text-green-300" : "text-red-300"
              }`}
            >
              R$ {saldo}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-300 rounded-full"></div>
            <span className="text-xs md:text-sm text-slate-300">Resultado</span>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 hidden sm:block">
        <div className="flex justify-between text-xs md:text-sm mb-1 text-slate-300">
          <span className="truncate">Receitas</span>
          <span className="truncate">Saldo</span>
          <span className="truncate">Despesas</span>
        </div>
        <div className="h-1.5 md:h-2 bg-white/6 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-green-400"
              style={{
                width: `${(receitas / (receitas + despesas || 1)) * 100}%`,
              }}
            ></div>
            <div
              className="bg-pink-400"
              style={{
                width: `${(despesas / (receitas + despesas || 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}
