import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Registra todos os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Componente de gráfico de linha para evolução
export const EvolutionChart = ({ data, title, yAxisLabel, color = 'rgb(59, 130, 246)' }) => {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: yAxisLabel,
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.3,
        fill: true,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${yAxisLabel}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return value + (yAxisLabel.includes('%') ? '%' : yAxisLabel.includes('kg') ? 'kg' : '')
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  return <Line data={chartData} options={options} />
}

// Componente de gráfico de barras para comparações
export const ComparisonChart = ({ data, title, yAxisLabel, colors = ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'] }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: yAxisLabel,
        data: data.map(item => item.value),
        backgroundColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    }
  }

  return <Bar data={chartData} options={options} />
}

// Componente de gráfico de rosca para distribuições
export const DistributionChart = ({ data, title, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%',
  }

  return <Doughnut data={chartData} options={options} />
}

// Componente de gráfico de múltiplas linhas
export const MultiLineChart = ({ datasets, labels, title, yAxisLabel }) => {
  const colors = [
    'rgb(59, 130, 246)',   // Blue
    'rgb(16, 185, 129)',   // Green
    'rgb(245, 158, 11)',   // Yellow
    'rgb(239, 68, 68)',    // Red
    'rgb(139, 92, 246)',   // Purple
  ]

  const chartData = {
    labels: labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
      tension: 0.3,
      fill: false,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return value + (yAxisLabel.includes('%') ? '%' : yAxisLabel.includes('kg') ? 'kg' : '')
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  return <Line data={chartData} options={options} />
}

// Componente de card de estatística
export const StatCard = ({ title, value, change, changeType, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      icon: 'text-purple-600'
    }
  }

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'negative':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color].bg}`}>
          <div className={`w-6 h-6 ${colorClasses[color].icon}`}>
            {icon}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`ml-2 flex items-center text-sm ${getChangeColor(changeType)}`}>
                {getChangeIcon(changeType)}
                <span className="ml-1">{change}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de gráfico de progresso circular
export const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3B82F6' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  )
}

