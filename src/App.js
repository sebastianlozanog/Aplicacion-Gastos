import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Statistics from './components/Statistics';

const API_URL = 'https://gestion-gastos-cmb7fuahareravab.canadaeast-01.azurewebsites.net/api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesRes, categoriesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/expenses`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/statistics/summary`)
      ]);
      
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense) => {
    try {
      const response = await axios.post(`${API_URL}/expenses`, expense);
      setExpenses([response.data, ...expenses]);
      fetchData(); // Refrescar estadísticas
    } catch (error) {
      console.error('Error al agregar gasto:', error);
      alert('Error al agregar gasto');
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      setExpenses(expenses.filter(exp => exp.id !== id));
      fetchData(); // Refrescar estadísticas
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      alert('Error al eliminar gasto');
    }
  };

  const updateExpense = async (id, updatedExpense) => {
    try {
      const response = await axios.put(`${API_URL}/expenses/${id}`, updatedExpense);
      setExpenses(expenses.map(exp => exp.id === id ? response.data : exp));
      fetchData(); // Refrescar estadísticas
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      alert('Error al actualizar gasto');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>💰 Gestión de Gastos</h1>
        <p className="subtitle">Controla tus finanzas personales</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          ➕ Agregar Gasto
        </button>
        <button 
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          📋 Mis Gastos
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📈 Estadísticas
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && statistics && (
          <Dashboard statistics={statistics} expenses={expenses} />
        )}
        
        {activeTab === 'add' && (
          <ExpenseForm 
            categories={categories} 
            onSubmit={addExpense}
            onSuccess={() => setActiveTab('list')}
          />
        )}
        
        {activeTab === 'list' && (
          <ExpenseList 
            expenses={expenses} 
            categories={categories}
            onDelete={deleteExpense}
            onUpdate={updateExpense}
          />
        )}
        
        {activeTab === 'stats' && (
          <Statistics expenses={expenses} />
        )}
      </main>
    </div>
  );
}

export default App;