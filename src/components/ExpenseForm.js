import React, { useState } from 'react';

function ExpenseForm({ categories, onSubmit, onSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Selecciona una categoría';
    }
    
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Resetear formulario
      setFormData({
        description: '',
        amount: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      alert('¡Gasto agregado exitosamente!');
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Error al agregar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="expense-form-container">
      <div className="form-header">
        <h2>➕ Agregar Nuevo Gasto</h2>
        <p>Registra tus gastos para mantener un control financiero</p>
      </div>
      
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="description">
            <span className="label-icon">📝</span>
            Descripción
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ej: Almuerzo en restaurante"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">
              <span className="label-icon">💵</span>
              Monto
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">
              <span className="label-icon">📅</span>
              Fecha
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category_id">
            <span className="label-icon">🏷️</span>
            Categoría
          </label>
          <div className="category-select">
            {categories.map(cat => (
              <label key={cat.id} className="category-option">
                <input
                  type="radio"
                  name="category_id"
                  value={cat.id}
                  checked={formData.category_id === String(cat.id)}
                  onChange={handleChange}
                />
                <div 
                  className={`category-button ${formData.category_id === String(cat.id) ? 'selected' : ''}`}
                  style={{ borderColor: cat.color }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.category_id && <span className="error-message">{errors.category_id}</span>}
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '⏳ Guardando...' : '💾 Guardar Gasto'}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;