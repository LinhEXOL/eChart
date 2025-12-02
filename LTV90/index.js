var dom = document.getElementById("chart-container");
var myChart = echarts.init(dom, null, {
  renderer: "canvas",
  useDirtyRect: false,
});

var option = {
  title: {
    text: "LTV90 Distribution",
    left: "center",
    top: 10,
  },
  grid: {
    left: 60,
    right: 20,
    top: 50,
    bottom: 80,
  },
  xAxis: {
    type: "category",
    name: "LTV_90 (bin)",
    nameLocation: "middle",
    data: [],
    axisLabel: {
      rotate: 90,
    },
  },
  yAxis: [
    {
      type: "value",
      name: "user",
      nameLocation: "middle",
      nameGap: 40,
      nameRotate: 90,
      nameGap: 50,
      nameTextStyle: {
        fontSize: 12,
        fontWeight: "normal",
      },
    },
  ],
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
  },
  series: [
    {
      name: "Players",
      type: "bar",
      barWidth: "70%",
      data: [],
      itemStyle: {
        color: "#4E79A7",
      },
    },
  ],
};

myChart.setOption(option);

$.get("data.json").done(function (data) {
  const binSize = 25; // mỗi bin rộng 25$
  // 1) Lấy các giá trị LTV và players
  const ltvValues = data.map((d) => Number(d.ltv));
  const maxLTV = Math.max(...ltvValues);

  // 2) Số lượng bin (0–25, 25–50, ... đến maxLTV)
  const binCount = Math.ceil(maxLTV / binSize);
  const bins = new Array(binCount).fill(0); // mỗi phần tử = tổng players trong bin đó

  // 3) Gán từng record vào bin tương ứng
  data.forEach((d) => {
    const ltv = Number(d.ltv);
    const players = Number(d.players);

    // đảm bảo không vượt quá range
    const clipped = Math.min(Math.max(ltv, 0), maxLTV - 1e-6);
    const idx = Math.floor(clipped / binSize); // index bin
    bins[idx] += players;
  });

  // 4) Tạo label trục X theo RANGE và tính tổng players
  const binLabels = [];
  let totalPlayers = 0;

  for (let i = 0; i < binCount; i++) {
    const from = i * binSize;
    const to = (i + 1) * binSize;
    binLabels.push(`$${from}–$${to}`);
    totalPlayers += bins[i];
  }

  // 5) Cập nhật chart với binLabels + bins
  myChart.setOption({
    xAxis: {
      data: binLabels,
    },
    tooltip: {
      formatter: function (params) {
        const p = params[0];
        const idx = p.dataIndex;
        const from = idx * binSize;
        const to = (idx + 1) * binSize;
        const playersInBin = bins[idx];
        const pct = (playersInBin / totalPlayers) * 100;

        return (
          `LTV range: $${from} – $${to}<br/>` +
          `Players: ${playersInBin}<br/>` +
          `Share: ${pct.toFixed(2)}%`
        );
      },
    },
    series: [
      {
        data: bins,
      },
    ],
  });
});

window.addEventListener("resize", myChart.resize);
