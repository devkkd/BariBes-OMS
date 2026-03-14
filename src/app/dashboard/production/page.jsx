'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, Plus, Search, Edit2, Trash2, X, Calendar, User, MapPin, Box as BoxIcon, Store as StoreIcon, CheckCircle, XCircle, Users, Scissors, AlertCircle } from 'lucide-react';
import MobileBackButton from '@/components/MobileBackButton';

export default function ProductionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [productions, setProductions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [karigars, setKarigars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [activeTab, setActiveTab] = useState('tailor'); // 'karigar' or 'tailor' - default to tailor
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [workerFilter, setWorkerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    orderIdManual: '',
    karigarId: '',
    karigarAssignedDate: '',
    karigarStatus: 'Not Assigned',
    karigarNotes: '',
    tailorId: '',
    tailoringDate: '',
    tailorStatus: 'Not Assigned',
    tailorNotes: '',
    status: 'Not Ready',
    notes: '',
  });
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Selection state for bulk delete
  const [selectedProductions, setSelectedProductions] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  useEffect(() => {
    checkAuth();
    fetchOrders();
    fetchTailors();
    fetchKarigars();
  }, []);

  // Handle URL parameters to auto-open modal
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const tab = searchParams.get('tab');
    
    if (orderId && orders.length > 0) {
      // Find the order
      const order = orders.find(o => {
        const displayId = o.subOrderNumber ? `${o.orderId}-${o.subOrderNumber}` : o.orderId;
        return displayId === orderId;
      });
      
      if (order) {
        // Auto-open modal with this order
        const displayOrderId = order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId;
        const today = new Date().toISOString().split('T')[0];
        
        // Check if production exists
        fetch(`/api/production?search=${displayOrderId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data.length > 0) {
              const production = data.data[0];
              
              // Validation: If opening tailor tab, check if karigar is completed
              if (tab === 'tailor' && production.karigarId && production.karigarStatus !== 'Completed') {
                showToast('Cannot assign to tailor. Karigar work is still in progress.', 'error');
                setActiveTab('karigar');
                return;
              }
              
              setFormData({
                orderIdManual: displayOrderId,
                karigarId: production.karigarId?._id || '',
                karigarAssignedDate: production.karigarAssignedDate ? new Date(production.karigarAssignedDate).toISOString().split('T')[0] : today,
                karigarStatus: production.karigarStatus || 'In Progress',
                karigarNotes: production.karigarNotes || '',
                tailorId: production.tailorId?._id || '',
                tailoringDate: production.tailoringDate ? new Date(production.tailoringDate).toISOString().split('T')[0] : today,
                tailorStatus: production.tailorStatus || 'In Progress',
                tailorNotes: production.tailorNotes || '',
                status: production.status,
                notes: production.notes || '',
              });
              setEditingProduction(production);
            } else {
              // New production
              setFormData({
                orderIdManual: displayOrderId,
                karigarId: '',
                karigarAssignedDate: today,
                karigarStatus: 'In Progress',
                karigarNotes: '',
                tailorId: '',
                tailoringDate: today,
                tailorStatus: 'In Progress',
                tailorNotes: '',
                status: 'Not Ready',
                notes: '',
              });
              setEditingProduction(null);
            }
            
            setActiveTab(tab || 'tailor');
            setShowModal(true);
            
            // Clear URL parameters
            router.replace('/dashboard/production', { scroll: false });
          })
          .catch(error => {
            console.error('Error loading production:', error);
          });
      }
    }
  }, [searchParams, orders]);

  useEffect(() => {
    if (orderSearchQuery) {
      const filtered = orders.filter(order => {
        const displayId = order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId;
        const searchLower = orderSearchQuery.toLowerCase();
        return (
          displayId.toLowerCase().includes(searchLower) ||
          (order.salesmanName && order.salesmanName.toLowerCase().includes(searchLower))
        );
      });
      setFilteredOrders(filtered);
      setShowOrderDropdown(true);
    } else {
      setFilteredOrders(orders);
      setShowOrderDropdown(false);
    }
  }, [orderSearchQuery, orders]);

  useEffect(() => {
    if (user) {
      fetchProductions();
    }
  }, [statusFilter, workerFilter, searchQuery, user, activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      if (!data.success) {
        router.push('/login');
        return;
      }
      
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchProductions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (workerFilter !== 'all') {
        if (activeTab === 'karigar') {
          params.append('karigarId', workerFilter);
        } else {
          params.append('tailorId', workerFilter);
        }
      }
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`/api/production?${params}`);
      const data = await res.json();
      if (data.success) {
        setProductions(data.data);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTailors = async () => {
    try {
      const res = await fetch('/api/tailors');
      const data = await res.json();
      if (data.success) {
        setTailors(data.tailors || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchKarigars = async () => {
    try {
      const res = await fetch('/api/karigars');
      const data = await res.json();
      if (data.success) {
        setKarigars(data.karigars || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openAddModal = () => {
    setEditingProduction(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      orderIdManual: '',
      karigarId: '',
      karigarAssignedDate: today,
      karigarStatus: 'In Progress',
      karigarNotes: '',
      tailorId: '',
      tailoringDate: today,
      tailorStatus: 'In Progress',
      tailorNotes: '',
      status: 'Not Ready',
      notes: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (production) => {
    setEditingProduction(production);
    setFormData({
      orderIdManual: production.orderNumber || '',
      karigarId: production.karigarId?._id || '',
      karigarAssignedDate: production.karigarAssignedDate ? new Date(production.karigarAssignedDate).toISOString().split('T')[0] : '',
      karigarStatus: production.karigarStatus || 'Not Assigned',
      karigarNotes: production.karigarNotes || '',
      tailorId: production.tailorId?._id || '',
      tailoringDate: production.tailoringDate ? new Date(production.tailoringDate).toISOString().split('T')[0] : '',
      tailorStatus: production.tailorStatus || 'Not Assigned',
      tailorNotes: production.tailorNotes || '',
      status: production.status,
      notes: production.notes || '',
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduction(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = editingProduction ? `/api/production/${editingProduction._id}` : '/api/production';
      const method = editingProduction ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        await fetchProductions();
        closeModal();
        showToast(
          editingProduction 
            ? 'Production record updated successfully' 
            : 'Production record created successfully',
          'success'
        );
      } else {
        setError(data.error || 'Something went wrong');
        showToast(data.error || 'Something went wrong', 'error');
      }
    } catch (error) {
      setError('Failed to save production record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (productionId, newStatus) => {
    try {
      const statusField = activeTab === 'karigar' ? 'karigarStatus' : 'tailorStatus';
      const res = await fetch(`/api/production/${productionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [statusField]: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchProductions();
        const workerType = activeTab === 'karigar' ? 'Karigar' : 'Tailor';
        showToast(`${workerType} status updated to ${newStatus}`, 'success');
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  // Selection handlers
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedProductions([]);
  };

  const toggleSelectAll = () => {
    if (selectedProductions.length === paginatedProductions.length) {
      setSelectedProductions([]);
    } else {
      setSelectedProductions(paginatedProductions.map(prod => prod._id));
    }
  };

  const toggleSelectProduction = (productionId) => {
    if (selectedProductions.includes(productionId)) {
      setSelectedProductions(selectedProductions.filter(id => id !== productionId));
    } else {
      setSelectedProductions([...selectedProductions, productionId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductions.length === 0) {
      showToast('Please select productions to delete', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProductions.length} production record(s)?`)) return;

    try {
      const results = await Promise.all(
        selectedProductions.map(productionId =>
          fetch(`/api/production/${productionId}`, { method: 'DELETE' }).then(res => res.json())
        )
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        await fetchProductions();
        showToast(`${successCount} production(s) deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`, 'success');
      } else {
        showToast('Failed to delete productions', 'error');
      }

      setSelectedProductions([]);
      setIsSelectionMode(false);
    } catch (error) {
      showToast('Failed to delete productions', 'error');
    }
  };

  const handleDelete = async (productionId) => {
    if (!confirm('Are you sure you want to delete this production record?')) return;

    try {
      const res = await fetch(`/api/production/${productionId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        await fetchProductions();
        showToast('Production record deleted successfully', 'success');
      } else {
        showToast(data.error || 'Failed to delete production record', 'error');
      }
    } catch (error) {
      showToast('Failed to delete production record', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Assigned': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Not Ready': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Ready': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter productions based on active tab
  const filteredProductions = productions.filter(prod => {
    if (activeTab === 'karigar') {
      // Karigar section: Show only if karigar is assigned
      return prod.karigarId && prod.karigarId !== null;
    } else {
      // Tailor section: Show only if tailor is assigned
      return prod.tailorId && prod.tailorId !== null;
    }
  });

  // Sort productions by date (newest first) and then by billing number (descending within each date)
  const sortedProductions = [...filteredProductions].sort((a, b) => {
    // First sort by assigned date (newest first) - use tailoringDate or karigarAssignedDate
    const dateA = new Date(a.tailoringDate || a.karigarAssignedDate || a.createdAt);
    const dateB = new Date(b.tailoringDate || b.karigarAssignedDate || b.createdAt);
    
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB - dateA; // Newest date first
    }
    
    // Within same date, sort by billing number (descending)
    const getNumericId = (orderNumber) => {
      const match = orderNumber.toString().match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    
    const numA = getNumericId(a.orderNumber);
    const numB = getNumericId(b.orderNumber);
    
    return numB - numA; // Descending order
  });

  const totalPages = Math.ceil(sortedProductions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProductions = sortedProductions.slice(startIndex, endIndex);

  // Group productions by date
  const groupProductionsByDate = (productions) => {
    const grouped = {};
    productions.forEach(production => {
      const date = new Date(production.tailoringDate || production.karigarAssignedDate || production.createdAt);
      const dateKey = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(production);
    });
    return grouped;
  };

  const groupedProductions = groupProductionsByDate(paginatedProductions);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#975a20] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MobileBackButton />
      
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Production Tracking</h2>
          <p className="text-sm sm:text-base text-gray-600">Track karigar and tailor workflow</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSelectionMode && selectedProductions.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-medium shadow-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedProductions.length})</span>
            </button>
          )}
          <button
            onClick={toggleSelectionMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium shadow-lg transition-colors text-sm ${
              isSelectionMode
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSelectionMode ? 'Cancel' : 'Select'}</span>
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Production</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('karigar');
              setWorkerFilter('all');
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'karigar'
                ? 'bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Karigar Section</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('tailor');
              setWorkerFilter('all');
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'tailor'
                ? 'bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Scissors className="w-5 h-5" />
            <span>Tailor Section</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search order/customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
          >
            <option value="all">{activeTab === 'karigar' ? 'All Karigars' : 'All Tailors'}</option>
            {(activeTab === 'karigar' ? karigars : tailors).map((worker, index) => (
              <option key={worker.id || worker._id || `worker-${index}`} value={worker.id || worker._id}>{worker.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Production Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isSelectionMode && (
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProductions.length === paginatedProductions.length && paginatedProductions.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-[#975a20] border-gray-300 rounded focus:ring-[#975a20] cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Billing Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Salesman</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  {activeTab === 'karigar' ? 'Karigar' : 'Tailor'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Storage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isSelectionMode ? "8" : "7"} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : paginatedProductions.length === 0 ? (
                <tr>
                  <td colSpan={isSelectionMode ? "8" : "7"} className="px-6 py-8 text-center text-gray-500">
                    No {activeTab} assignments found
                  </td>
                </tr>
              ) : (
                Object.entries(groupedProductions).map(([date, productions]) => (
                  <React.Fragment key={`date-group-${date}`}>
                    {/* Date Header Row */}
                    <tr key={`date-${date}`} className="bg-gradient-to-r from-[#975a20]/10 to-[#7d4a1a]/10">
                      <td colSpan={isSelectionMode ? "8" : "7"} className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#975a20]" />
                          <span className="text-sm font-bold text-[#975a20]">{date}</span>
                          <span className="text-xs text-gray-600">({productions.length} production{productions.length > 1 ? 's' : ''})</span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Productions for this date */}
                    {productions.map((production) => (
                  <tr key={production._id} className={`hover:bg-gray-50 transition-colors ${selectedProductions.includes(production._id) ? 'bg-blue-50' : ''}`}>
                    {isSelectionMode && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProductions.includes(production._id)}
                          onChange={() => toggleSelectProduction(production._id)}
                          className="w-4 h-4 text-[#975a20] border-gray-300 rounded focus:ring-[#975a20] cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{production.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{production.salesmanName || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {activeTab === 'karigar' ? <Users className="w-4 h-4 text-gray-400" /> : <Scissors className="w-4 h-4 text-gray-400" />}
                        <span className="text-sm text-gray-600">
                          {activeTab === 'karigar' 
                            ? (production.karigarId?.name || 'Not Assigned')
                            : (production.tailorId?.name || 'Not Assigned')
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {activeTab === 'karigar'
                            ? (production.karigarAssignedDate ? new Date(production.karigarAssignedDate).toLocaleDateString() : '-')
                            : (production.tailoringDate ? new Date(production.tailoringDate).toLocaleDateString() : '-')
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={activeTab === 'karigar' ? production.karigarStatus : production.tailorStatus}
                        onChange={(e) => handleStatusChange(production._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border outline-none cursor-pointer transition-colors ${
                          getStatusColor(activeTab === 'karigar' ? production.karigarStatus : production.tailorStatus)
                        }`}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {production.tailorStatus === 'Completed' ? (
                        production.location ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-green-600 mb-1">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium">Assigned</span>
                            </div>
                            <div className="space-y-1">
                              {/* <div className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-700 font-medium">
                                  {production.location === 'godown' ? 'Godown' : production.location === 'shop' ? 'Shop' : 'Showroom'}
                                </span>
                              </div> */}
                              {production.storeId?.name && (
                                <div className="flex items-center gap-1 text-xs">
                                  <StoreIcon className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">{production.storeId.name}</span>
                                </div>
                              )}
                              {production.boxId?.name && (
                                <div className="flex items-center gap-1 text-xs">
                                  <BoxIcon className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">{production.boxId.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => router.push('/dashboard/storage')}
                            className="text-xs px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                          >
                            Assign Storage
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(production)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(production._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredProductions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredProductions.length)} of {filteredProductions.length} records
            </div>
            <div className="flex items-center gap-2 text-black">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white font-semibold'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl my-4 md:my-8 max-h-[95vh] md:max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-200 flex-shrink-0">
              <div>
                <h3 className="text-base md:text-xl font-bold text-gray-900">
                  {editingProduction ? 'Edit Production' : 'Add Production'}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {activeTab === 'karigar' ? 'Assign to Karigar' : 'Assign to Tailor'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-6">
                {error && (
                  <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs md:text-sm">
                    {error}
                  </div>
                )}

                {/* Order Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Order <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (orderSearchQuery) setShowOrderDropdown(true);
                        }}
                        placeholder="Type to search Billing Number, Customer Name, or Phone..."
                        className="w-full pl-11 pr-10 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] focus:border-[#975a20] outline-none text-gray-900 bg-white transition-all placeholder:text-gray-400 font-medium"
                        autoComplete="off"
                      />
                      {orderSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrderSearchQuery('');
                            setFormData({ ...formData, orderIdManual: '' });
                            setShowOrderDropdown(false);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>

                    {/* Dropdown Results */}
                    {showOrderDropdown && filteredOrders.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        <div className="p-2 space-y-1">
                          {filteredOrders.slice(0, 10).map((order, index) => {
                            const displayId = order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId;
                            return (
                              <button
                                key={order.id || order._id || `order-${index}`}
                                type="button"
                                onClick={() => {
                                  setFormData({ 
                                    ...formData, 
                                    orderIdManual: displayId
                                  });
                                  setOrderSearchQuery(displayId);
                                  setShowOrderDropdown(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#975a20]/10 hover:to-[#7d4a1a]/10 transition-all group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white">
                                        {displayId}
                                      </span>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'In Production' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'Ready' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {order.status}
                                      </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#975a20] transition-colors">
                                      Order #{displayId}
                                    </p>
                                    {order.salesmanName && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        Salesman: {order.salesmanName}
                                      </p>
                                    )}
                                    {order.quantity && order.quantity > 1 && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        Qty: {order.quantity}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="text-xs text-gray-500">Delivery</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected Order Card */}
                    {formData.orderIdManual && !showOrderDropdown && (
                      <div className="mt-3 p-4 bg-gradient-to-br from-[#975a20]/5 via-[#7d4a1a]/5 to-[#975a20]/5 border-2 border-[#975a20]/20 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-1">Selected Order</p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white shadow-sm">
                                {formData.orderIdManual}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">Order #{formData.orderIdManual}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, orderIdManual: '' });
                              setOrderSearchQuery('');
                            }}
                            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                            title="Clear selection"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    )}

                    <input type="hidden" value={formData.orderIdManual} required />
                  </div>
                </div>

                {/* Karigar Section - Only show when on Karigar tab */}
                {activeTab === 'karigar' && (
                  <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-bold text-gray-900">Karigar Assignment</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Karigar <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.karigarId}
                          onChange={(e) => setFormData({ ...formData, karigarId: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                          required
                        >
                          <option value="">Select Karigar</option>
                          {karigars.map((karigar, index) => (
                            <option key={karigar.id || karigar._id || `karigar-${index}`} value={karigar.id || karigar._id}>
                              {karigar.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Date</label>
                        <input
                          type="date"
                          value={formData.karigarAssignedDate}
                          onChange={(e) => setFormData({ ...formData, karigarAssignedDate: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Karigar Status</label>
                        <select
                          value={formData.karigarStatus}
                          onChange={(e) => setFormData({ ...formData, karigarStatus: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Karigar Notes</label>
                        <textarea
                          value={formData.karigarNotes}
                          onChange={(e) => setFormData({ ...formData, karigarNotes: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                          placeholder="Notes for karigar..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tailor Section - Only show when on Tailor tab */}
                {activeTab === 'tailor' && (
                  <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Scissors className="w-5 h-5 text-purple-600" />
                      <h4 className="text-lg font-bold text-gray-900">Tailor Assignment</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tailor <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.tailorId}
                          onChange={(e) => setFormData({ ...formData, tailorId: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                          required
                        >
                          <option value="">Select Tailor</option>
                          {tailors.map((tailor, index) => (
                            <option key={tailor.id || tailor._id || `tailor-${index}`} value={tailor.id || tailor._id}>
                              {tailor.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tailoring Date</label>
                        <input
                          type="date"
                          value={formData.tailoringDate}
                          onChange={(e) => setFormData({ ...formData, tailoringDate: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tailor Status</label>
                        <select
                          value={formData.tailorStatus}
                          onChange={(e) => setFormData({ ...formData, tailorStatus: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tailor Notes</label>
                        <textarea
                          value={formData.tailorNotes}
                          onChange={(e) => setFormData({ ...formData, tailorNotes: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                          placeholder="Notes for tailor..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">General Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingProduction ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium text-sm">{toast.message}</p>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-2 p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
