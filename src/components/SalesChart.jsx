import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

export default function SalesChart({ data }) {
  const chartData = {
    // Labels for the x-axis (date)
    labels: data.map(entry => entry.date),
    
    datasets: [
      {
        label: 'Total Sales (₹)',
        // Data for the y-axis (sales amount)
        data: data.map(entry => entry.amount),
        borderColor: '#C7A718', // Indigo-500
        backgroundColor: 'transparent',
        //  backgroundColor: (context) => {
        //   const ctx = context.chart.ctx;
        //   const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        //   gradient.addColorStop(0, 'rgba(217, 163, 0, 0.87)');   // Indigo-500
        //   gradient.addColorStop(1, 'rgba(222, 188, 38, 0.23)');
        //   return gradient;
        // }
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#C7A720',
        pointBorderWidth: 1,
        pointBorderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#6b7280', // Tailwind Gray-500
          font: { size: 12, weight: '500' },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#201d27', // Gray-900
        titleColor: '#f1f1f1',
        bodyColor: '#f8f8f8', // Gray-300
        cornerRadius: 4,
        padding: 15,
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9f7800',
          font: { size: 8 },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)', // subtle x grid
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9f7800',
          font: { size: 9 },
          callback: (value) => `₹${value.toLocaleString()}`, // Format y-axis as ₹
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)', // subtle y grid
        },
      },
    },
  };

  return (
    <div className="p-3 border-0" style={{ height: '340px' }}>
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
