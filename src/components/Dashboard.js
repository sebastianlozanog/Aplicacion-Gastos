import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function Dashboard({ statistics, expenses }) {
  const recentExpenses = expenses.slice(0, 5);
  
  const chartData = statistics.byCategory
    .filter(cat => cat.total > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.total,
      color: cat.color,
      icon: cat.icon
    }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].payload.icon} ${payload[0].name}`}</p>
          <p className="value">{formatCurrency(payload[0].value)}</p>
          <p className="percentage">{`${((payload[0].value / statistics.monthly) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Total General</h3>
            <p className="stat-value">{formatCurrency(statistics.total)}</p>
          </div>
        </div>
        
        <div className="stat-card monthly">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Este Mes</h3>
            <p className="stat-value">{formatCurrency(statistics.monthly)}</p>
          </div>
        </div>
        
        <div className="stat-card count">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Gastos</h3>
            <p className="stat-value">{expenses.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-container">
          <h2>Gastos por Categoría (Este Mes)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>No hay gastos registrados este mes</p>
            </div>
          )}
        </div>

        <div className="recent-expenses">
          <h2>Gastos Recientes</h2>
          <div className="expense-items">
            {recentExpenses.length > 0 ? (
              recentExpenses.map(expense => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-icon" style={{ backgroundColor: expense.color }}>
                    {expense.icon}
                  </div>
                  <div className="expense-details">
                    <p className="expense-description">{expense.description}</p>
                    <p className="expense-category">{expense.category_name}</p>
                    <p className="expense-date">
                      {format(new Date(expense.date), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div className="expense-amount">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No hay gastos registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="category-breakdown">
        <h2>Detalle por Categoría</h2>
        <div className="category-grid">
          {statistics.byCategory.map(cat => (
            <div key={cat.name} className="category-card" style={{ borderColor: cat.color }}>
              <div className="category-header">
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </div>
              <div className="category-amount" style={{ color: cat.color }}>
                {formatCurrency(cat.total)}
              </div>
              <div className="category-bar">
                <div 
                  className="category-bar-fill" 
                  style={{ 
                    width: `${(cat.total / statistics.monthly) * 100}%`,
                    backgroundColor: cat.color 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;