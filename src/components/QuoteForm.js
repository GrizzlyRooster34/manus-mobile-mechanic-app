import React, { useState } from 'react';
import { addQuoteToServiceRequest } from '../firebase/services';

const QuoteForm = ({ requestId, requestDetails, onQuoteSubmitted }) => {
  const [formData, setFormData] = useState({
    laborCost: '',
    partsCost: '',
    estimatedHours: '',
    notes: '',
    totalCost: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Auto-calculate total cost when labor or parts costs change
    if (name === 'laborCost' || name === 'partsCost') {
      const laborCost = name === 'laborCost' ? parseFloat(value) || 0 : parseFloat(formData.laborCost) || 0;
      const partsCost = name === 'partsCost' ? parseFloat(value) || 0 : parseFloat(formData.partsCost) || 0;
      
      setFormData(prevState => ({
        ...prevState,
        totalCost: (laborCost + partsCost).toFixed(2)
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form
    if (!formData.laborCost || !formData.estimatedHours || !formData.totalCost) {
      setError('Labor cost, estimated hours, and total cost are required');
      return;
    }
    
    setLoading(true);
    
    try {
      const quoteData = {
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      const result = await addQuoteToServiceRequest(requestId, quoteData);
      
      if (result.success) {
        setSuccess('Quote submitted successfully!');
        if (onQuoteSubmitted) {
          onQuoteSubmitted();
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while submitting the quote');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Quote</h2>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold text-lg mb-2">Service Request Details</h3>
        <p><span className="font-medium">Vehicle:</span> {requestDetails?.vehicleYear} {requestDetails?.vehicleMake} {requestDetails?.vehicleModel}</p>
        <p><span className="font-medium">Service Type:</span> {requestDetails?.serviceType}</p>
        <p><span className="font-medium">Description:</span> {requestDetails?.serviceDescription}</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="laborCost">
              Labor Cost ($)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="laborCost"
              type="number"
              step="0.01"
              min="0"
              name="laborCost"
              value={formData.laborCost}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="partsCost">
              Parts Cost ($)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="partsCost"
              type="number"
              step="0.01"
              min="0"
              name="partsCost"
              value={formData.partsCost}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estimatedHours">
              Estimated Hours
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="estimatedHours"
              type="number"
              step="0.5"
              min="0.5"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              placeholder="1.0"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalCost">
              Total Cost ($)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              id="totalCost"
              type="number"
              step="0.01"
              min="0"
              name="totalCost"
              value={formData.totalCost}
              onChange={handleChange}
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Additional details about the quote..."
          ></textarea>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting Quote...' : 'Submit Quote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;
