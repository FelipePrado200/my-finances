"use client";

export function Hero() {
  const dataPoints = [
    { y: 70, value: "R$ 4.2k" },
    { y: 60, value: "R$ 4.9k" },
    { y: 40, value: "R$ 6.0k" },
    { y: 55, value: "R$ 5.2k" },
    { y: 30, value: "R$ 6.4k" },
    { y: 20, value: "R$ 6.8k" },
    { y: 10, value: "R$ 7.5k" },
  ];

  const width = 500;
  const height = 80;
  const spacing = width / (dataPoints.length - 1);

  const pathD = dataPoints
    .map((point, i) => `${i === 0 ? "M" : "L"} ${i * spacing} ${point.y}`)
    .join(" ");

  return (
    <section className="mt-5  bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-5 mt-15 flex flex-col justify-center items-center lg:flex ">
      <p className="text-1xl md:text-3xl font-extrabold tracking-wide max-w-3xl text-center mb-6">
        Acompanhe suas receitas, despesas e saldo de forma simples e eficiente.
      </p>

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-xl p-10">
        <div className="flex justify-between items-center mb-3 ">
          <h3 className="text-base font-bold">Progresso do Lucro - 2024</h3>
          <span className="text-xs px-2 py-1 bg-white/20 rounded">↑ 32%</span>
        </div>

        <div className="relative h-50 ">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Linha do gráfico */}
            <path
              d={pathD}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.9"
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: "lineDraw 1s ease forwards",
              }}
            />

            {/* Pontos do gráfico */}
            {dataPoints.map((point, i) => (
              <circle
                key={i}
                cx={i * spacing}
                cy={point.y}
                r="3"
                fill="white"
              />
            ))}
          </svg>

          {/* Meses */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-between text-xs text-white/70 border-t border:bg-white p-2">
            {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"].map((m) => (
              <div key={m}>{m}</div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes lineDraw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
}
