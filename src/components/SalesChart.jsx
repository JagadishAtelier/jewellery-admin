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
        borderColor: '#6366f1', // Indigo-500
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');   // Indigo-500
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#6366f1',
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
        backgroundColor: '#111827', // Gray-900
        titleColor: '#fff',
        bodyColor: '#d1d5db', // Gray-300
        cornerRadius: 4,
        padding: 12,
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
          font: { size: 12 },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)', // subtle x grid
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280',
          font: { size: 12 },
          callback: (value) => `₹${value.toLocaleString()}`, // Format y-axis as ₹
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)', // subtle y grid
        },
      },
    },
  };

  return (
    <div className="card shadow-sm p-3 mb-4 border-0" style={{ height: '340px' }}>
      <h5 className="text-secondary mb-3">Sales Trend</h5>
      <div style={{ height: '280px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
