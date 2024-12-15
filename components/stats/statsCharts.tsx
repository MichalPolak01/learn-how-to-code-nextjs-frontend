import { ResponsiveContainer, RadialBarChart, RadialBar, Cell, PolarAngleAxis } from "recharts";

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export default function StatsCharts({ stats }: { stats: ChartStats }) {
  const chartData: ChartData[] = [
    {
      name: "Lekcje ukończone",
      value: (stats.completed_lessons / stats.lesson_count * 100) || 0.0,
      fill: "hsl(var(--nextui-success))",
    },
    {
      name: "Średnia ocen z zadań",
      value: stats.assignment_score_percentage,
      fill: "hsl(var(--nextui-warning))",
    },
    {
      name: "Średnia ocen z quizów",
      value: stats.quiz_score_percentage,
      fill: "hsl(var(--nextui-danger))",
    },
    {
      name: "Średnia wyników",
      value: (stats.assignment_score_percentage + stats.quiz_score_percentage) / 2,
      fill: "hsl(var(--nextui-secondary))",
    },
  ];

  return (
    <div className="h-full gap-x-3 grid sm:grid-cols-2 md:grid-cols-4">
      {chartData.map((data, index) => (
        <ResponsiveContainer key={index} height={200} width={"100%"}>
          <RadialBarChart
            barSize={10}
            cx="50%"
            cy="50%"
            data={[data]}
            endAngle={-45}
            innerRadius={90}
            outerRadius={70}
            startAngle={225}
          >
            <PolarAngleAxis
              angleAxisId={0}
              domain={[0, 100]}
              tick={false}
              type="number"
            />
            <RadialBar
              background
              cornerRadius={10}
              dataKey="value"
              fill={data.fill}
            >
              <Cell key={`cell-${index}`} fill={data.fill} />
            </RadialBar>
            <text
              className="text-center font-bold text-xs"
              style={{ fill: "hsl(var(--nextui-default-700))" }}
              textAnchor="middle"
              x="50%"
              y="50%"
            >
              <tspan dy="-0.5em">{data.name}</tspan>
              <tspan dy="1.5em" x="50%">
                {data.value.toFixed(2)}%
              </tspan>
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      ))}
    </div>
  );
}