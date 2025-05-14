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

export default function GoldRateChart({ goldRateData }) {
  const [range, setRange] = useState('7D'); // Default range is 7D

  // Filter data based on selected range (1D or 7D)
  const sortedData = [...goldRateData].sort((a, b) => new Date(a.date) - new Date(b.date));
const filteredData = range === '1D' 
  ? [sortedData[sortedData.length - 1]] 
  : sortedData.slice(-7);


  const chartData = {
    labels: [],
    datasets: [
      {
        label: '18k Gold Rate (₹)',
        data: [],
        borderColor: '#6366f1',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
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
      {
        label: '22k Gold Rate (₹)',
        data: [],
        borderColor: '#f97316',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0.05)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#f97316',
        pointBorderWidth: 1,
        pointBorderColor: '#fff',
      },
      {
        label: '24k Gold Rate (₹)',
        data: [],
        borderColor: '#16a34a',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(22, 163, 74, 0.4)');
          gradient.addColorStop(1, 'rgba(22, 163, 74, 0.05)');
          return gradient;
        },
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
  function formatDateTime(dateStr, timeStr) {
 
    // Convert 24-hour time to 12-hour time with AM/PM
    const [hour, minute] = timeStr.split(':');
    let hours = parseInt(hour, 10);
    const minutes = minute;
  
    let period = 'AM';
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) hours -= 12; // Convert hour to 12-hour format
    } else if (hours === 0) {
      hours = 12; // Midnight case
    }
  
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  
    return `${dateStr} ${formattedTime}`; // Example: "06/05/2025 01:00 AM"
  }
  // Prepare chart data based on the filtered range
  filteredData.forEach((day) => {
    const rateEntries = Object.entries(day.rates || {});
    rateEntries.forEach(([time, rateObj]) => {
        const formattedLabel = formatDateTime(day.date, time);
        chartData.labels.push(formattedLabel);
      
        chartData.datasets[0].data.push(rateObj['18k'] || 0); // 18k
        chartData.datasets[1].data.push(rateObj['22k'] || 0); // 22k
        chartData.datasets[2].data.push(rateObj['24k'] || 0); // 24k
      });
      
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#6b7280',
          font: { size: 12, weight: '500' },
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
          maxRotation: 45,
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
          font: { size: 12 },
          callback: (value) => `₹${value.toLocaleString()}`, 
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)', 
        },
      },
    },
  };

  return (
    <div className="card shadow-sm p-3 mb-4 border-0" style={{ height: '340px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* <h5 className="text-secondary">Gold Rate</h5> */}
        <div className="btn-group">
          <button onClick={() => setRange('1D')} className={`btn btn-sm ${range === '1D' ? 'btn-primary' : 'btn-outline-primary'}`}>1D</button>
          <button onClick={() => setRange('7D')} className={`btn btn-sm ${range === '7D' ? 'btn-primary' : 'btn-outline-primary'}`}>7D</button>
        </div>
      </div>
      <div style={{ height: '280px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
