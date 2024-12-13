import {ResponsiveContainer, RadialBarChart, RadialBar, Cell, PolarAngleAxis} from "recharts";

interface ChartData {
    name: string;
    value: number;
    fill: string;
  }
  
  export default function StatsCharts({ stats, username }: { stats: Stats[], username: string }) {
    const currentUserStats = stats.find((stat) => stat.username === username);

    if (!currentUserStats) {
        return <p className="ml-6 mb-8 text-light italic text-md">Brak statystyk. Kiedy ukończysz lekcję tu pojawią się twoeje statystyki.</p>
    }
  
    const chartData: ChartData[] = [
      {
        name: "Lekcje ukończone",
        value: currentUserStats.completed_lessons / currentUserStats.lesson_count *100,
        fill: "hsl(var(--nextui-primary))",
      },
      {
        name: "Średnia ocen z zadań",
        value: currentUserStats.assignment_score_percentage,
        fill: "hsl(var(--nextui-warning))",
      },
      {
        name: "Średnia ocen z quizów",
        value: currentUserStats.quiz_score_percentage,
        fill: "hsl(var(--nextui-danger))",
      },
      {
        name: "Średnia wyników",
        value: (currentUserStats.assignment_score_percentage + currentUserStats.quiz_score_percentage) / 2,
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