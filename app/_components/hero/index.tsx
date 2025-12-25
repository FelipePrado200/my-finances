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
    <section className="mt-6 w-full flex flex-col items-center">
      <p className="text-lg md:text-3xl font-extrabold tracking-wide max-w-3xl text-center mb-6 text-slate-100">
        Acompanhe suas receitas, despesas e saldo de forma simples e eficiente.
      </p>

      <div className="w-full max-w-3xl glass p-6 md:p-10 rounded-2xl elevated">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Progresso do Lucro - 2024
            </h3>
            <p className="text-sm text-slate-300">
              Visão rápida de performance
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-indigo-900/20 rounded-full text-indigo-300 font-medium">
            ↑ 32%
          </span>
        </div>

        <div className="relative h-48">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            <path
              d={pathD}
              fill="none"
              stroke="#e6eef8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.95"
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: "lineDraw 1s ease forwards",
              }}
            />

            {dataPoints.map((point, i) => (
              <circle
                key={i}
                cx={i * spacing}
                cy={point.y}
                r="3"
                fill="#e6eef8"
              />
            ))}
          </svg>

          <div className="absolute -bottom-2 left-0 right-0 flex justify-between text-xs text-slate-300 p-2">
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
