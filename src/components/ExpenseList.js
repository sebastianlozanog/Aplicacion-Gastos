import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function ExpenseList({ expenses, categories, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      description: expense.description,
      amount: expense.amount,
      category_id: expense.category_id,
      date: expense.date
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    await onUpdate(id, {
      ...editForm,
      amount: parseFloat(editForm.amount)
    });
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id, description) => {
    if (window.confirm(`¿Estás seguro de eliminar "${description}"?`)) {
      onDelete(id);
    }
  };

  // Filtrar gastos
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filter === 'all' || expense.category_id === parseInt(filter);
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calcular total filtrado
  const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="expense-list-container">
      <div className="list-header">
        <h2>📋 Mis Gastos</h2>
        <div className="list-stats">
          <span className="stat-badge">
            Total: {formatCurrency(totalFiltered)}
          </span>
          <span className="stat-badge">
            {filteredExpenses.length} gastos
          </span>
        </div>
      </div>

      <div className="list-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="expenses-table">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="expense-row">
              {editingId === expense.id ? (
                // Modo edición
                <div className="expense-edit-form">
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Descripción"
                  />
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    placeholder="Monto"
                    step="0.01"
                  />
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({...editForm, category_id: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  />
                  <div className="edit-actions">
                    <button onClick={() => saveEdit(expense.id)} className="btn-save">
                      ✓ Guardar
                    </button>
                    <button onClick={cancelEdit} className="btn-cancel">
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <>
                  <div className="expense-info">
                    <div 
                      className="expense-category-badge" 
                      style={{ backgroundColor: expense.color }}
                    >
                      {expense.icon}
                    </div>
                    <div className="expense-details-column">
                      <p className="expense-desc">{expense.description}</p>
                      <div className="expense-meta">
                        <span className="expense-cat">{expense.category_name}</span>
                        <span className="expense-date-text">
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="expense-actions-container">
                    <span className="expense-amount-large" style={{ color: expense.color }}>
                      {formatCurrency(expense.amount)}
                    </span>
                    <div className="expense-actions">
                      <button 
                        onClick={() => startEdit(expense)}
                        className="btn-edit"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id, expense.description)}
                        className="btn-delete"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="no-expenses">
            <div className="no-expenses-icon">📭</div>
            <p>No hay gastos que mostrar</p>
            <p className="no-expenses-hint">
              {searchTerm || filter !== 'all' 
                ? 'Intenta cambiar los filtros' 
                : 'Comienza agregando tu primer gasto'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseList;