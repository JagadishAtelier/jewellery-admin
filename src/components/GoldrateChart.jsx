import { useState } from 'react';
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

export default function GoldRateChart({ data = [], metalType = "Gold" }) {
  const [range, setRange] = useState('1D');

  // Sort by timestamp (latest last)
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Filter by range
  const filteredData = range === '1D' ? sortedData.slice(-4) : sortedData.slice(-28); // 4 readings for 1D, 28 for 7D (e.g. 4 per day)

  const chartData = {
    labels: filteredData.map(d => d.timestamp),
    datasets: [
      {
        label: `18k ${metalType} Rate (₹)`,
        data: filteredData.map(d => d['18k'] ?? 0),
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#6366f1',
        pointBorderWidth: 1,
        pointBorderColor: '#fff',
      },
      {
        label:  `22k ${metalType} Rate (₹)`,
        data: filteredData.map(d => d['22k'] ?? 0),
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#f97316',
        pointBorderWidth: 1,
        pointBorderColor: '#fff',
      },
      {
        label:  `24k ${metalType} Rate (₹)`,
        data: filteredData.map(d => d['24k'] ?? 0),
        borderColor: '#16a34a',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#16a34a',
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
          color: '#6b7280',
          font: { size: 10, weight: '500' },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
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
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)', 
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
          callback: (value) => `₹${value.toLocaleString()}`, 
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)', 
        },
      },
    },
  };

  return (
    <div className="p-3 mb-4" style={{ height: '340px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="btn-group">
          <button onClick={() => setRange('1D')} className={`btn btn-sm ${range === '1D' ? 'btn-primary' : 'btn-outline-primary'}`}>1D</button>
          <button onClick={() => setRange('7D')} className={`btn btn-sm ${range === '7D' ? 'btn-primary' : 'btn-outline-primary'}`}>7D</button>
        </div>
      </div>
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
