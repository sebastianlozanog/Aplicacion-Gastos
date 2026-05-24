import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

function Statistics({ expenses }) {
  const [period, setPeriod] = useState('month');
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    calculateMonthlyData();
    calculateDailyData();
  }, [expenses]);

  const calculateMonthlyData = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });
      
      const total = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      last6Months.push({
        month: format(date, 'MMM yyyy', { locale: es }),
        total: total,
        count: monthExpenses.length
      });
    }
    setMonthlyData(last6Months);
  };

  const calculateDailyData = () => {
    const currentMonth = new Date();
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const dailyTotals = days.map(day => {
      const dayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return format(expDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      
      const total = dayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      return {
        day: format(day, 'dd', { locale: es }),
        date: format(day, 'dd MMM', { locale: es }),
        total: total
      };
    });
    
    setDailyData(dailyTotals);
  };

  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });

  const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const avgPerDay = currentMonthTotal / new Date().getDate();
  const maxExpense = currentMonthExpenses.length > 0 
    ? Math.max(...currentMonthExpenses.map(exp => parseFloat(exp.amount)))
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          <p className="value" style={{ color: payload[0].color }}>
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.count && (
            <p className="count">{payload[0].payload.count} gastos</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <h2>📈 Análisis y Estadísticas</h2>
        <div className="period-selector">
          <button 
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Este Mes
          </button>
          <button 
            className={period === 'history' ? 'active' : ''}
            onClick={() => setPeriod('history')}
          >
            Histórico
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <p className="summary-label">Total del Mes</p>
            <p className="summary-value">{formatCurrency(currentMonthTotal)}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <p className="summary-label">Promedio Diario</p>
            <p className="summary-value">{formatCurrency(avgPerDay)}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">🔝</div>
          <div className="summary-content">
            <p className="summary-label">Gasto Mayor</p>
            <p className="summary-value">{formatCurrency(maxExpense)}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📝</div>
          <div className="summary-content">
            <p className="summary-label">Total Registros</p>
            <p className="summary-value">{currentMonthExpenses.length}</p>
          </div>
        </div>
      </div>

      {period === 'month' && dailyData.length > 0 && (
        <div className="chart-section">
          <h3>Gastos Diarios - {format(new Date(), 'MMMM yyyy', { locale: es })}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {period === 'history' && monthlyData.length > 0 && (
        <div className="chart-section">
          <h3>Evolución Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="monthly-breakdown">
            <h3>Detalle Mensual</h3>
            <div className="breakdown-grid">
              {monthlyData.map((month, index) => (
                <div key={index} className="breakdown-card">
                  <p className="breakdown-month">{month.month}</p>
                  <p className="breakdown-total">{formatCurrency(month.total)}</p>
                  <p className="breakdown-count">{month.count} gastos</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistics;