var dom = document.getElementById("chart-container");
var myChart = echarts.init(dom, null, {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};

var option;

const rawData = [
  [0, 1.0],
  [1, 0.4],
  [3, 0.23],
  [7, 0.16],
];

// HÀM FIT y = A * n^B
// Lọc tự động: chỉ lấy điểm có x>0 (Day0 sẽ KHÔNG dùng để fit)
function fitPowerRegression(data) {
  const pts = data.filter(([x, y]) => x > 0 && y > 0);

  const n = pts.length;
  let sumX = 0,
    sumY = 0,
    sumXX = 0,
    sumXY = 0;

  pts.forEach(([x, y]) => {
    const X = Math.log(x);
    const Y = Math.log(y);
    sumX += X;
    sumY += Y;
    sumXX += X * X;
    sumXY += X * Y;
  });

  const denom = n * sumXX - sumX * sumX;
  const B = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - B * sumX) / n;
  const A = Math.exp(a);

  return { A, B };
}

const { A, B } = fitPowerRegression(rawData);

// TẠO ĐƯỜNG HỒI QUY
const regressionData = [];

// n=0 tự set retention = 1
regressionData.push([0, 1]);

// từ 1 đến 90, step 1
for (let x = 1; x <= 90; x += 1) {
  regressionData.push([x, A * Math.pow(x, B)]);
}

// CHART OPTION
option = {
  title: {
    text: "Fitting a Retention Curve to DnR Observations",
    left: "center",
    top: 10,
    textStyle: { fontSize: 14 },
  },
  grid: { left: 60, right: 20, top: 60, bottom: 60 },
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "line" },
    formatter: function (params) {
      const p =
        params.find((x) => x.seriesName === "r(n) = a * n^b") || params[0];
      return `n = ${p.value[0]}<br/>r(n) = ${p.value[1].toFixed(3)}`;
    },
  },
  xAxis: {
    type: "value",
    name: "n",
    nameLocation: "middle",
    min: 0,
    max: 90,
    // set tick interval to 10 (was showing 20)
    interval: 10,
    splitLine: { lineStyle: { type: "dashed" } },
  },
  yAxis: {
    type: "value",
    name: "DnR",
    nameLocation: "middle",
    min: 0,
    max: 1,
    splitLine: { lineStyle: { type: "dashed" } },
  },
  graphic: [
    {
      type: "text",
      left: "center",
      top: "72%",
      style: {
        text: `r(n) = ${A.toFixed(3)} * n^(${B.toFixed(3)})`,
        fill: "#555",
        fontSize: 12,
      },
    },
  ],
  series: [
    {
      name: "observations",
      type: "scatter",
      data: rawData,
      symbolSize: 8,
      itemStyle: { color: "#4E79A7" },
    },
    {
      name: "observations",
      type: "line",
      data: rawData,
      symbol: "circle",
      showSymbol: true,
      symbolSize: 8,
      itemStyle: {
        // fill color for the symbol
        color: "#4E79A7",
        // make the border the same color (optional)
        borderColor: "#4E79A7",
        borderWidth: 1,
      },
    },
    {
      name: "r(n) = a * n^b",
      type: "line",
      data: regressionData,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 1.5, color: "#888", type: "dashed" },
      encode: { x: 0, y: 1 },
    },
  ],
};

if (option && typeof option === "object") {
  myChart.setOption(option);
}

window.addEventListener("resize", myChart.resize);
