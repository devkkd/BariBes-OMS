'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Plus, Search, Edit2, Trash2, X, Calendar, User, MapPin, Box as BoxIcon, Store as StoreIcon, CheckCircle, XCircle } from 'lucide-react';

export default function ProductionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [productions, setProductions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [tailorFilter, setTailorFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [boxFilter, setBoxFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    orderIdManual: '',
    customerName: '',
    tailorId: '',
    tailoringDate: '',
    isReady: false,
    location: 'godown',
    boxId: '',
    storeId: '',
    status: 'Not Ready',
    notes: '',
  });
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchOrders();
    fetchTailors();
    fetchBoxes();
    fetchStores();
  }, []);

  useEffect(() => {
    // Filter orders based on search query
    if (orderSearchQuery) {
      const filtered = orders.filter(order => {
        const displayId = order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId;
        const searchLower = orderSearchQuery.toLowerCase();
        return (
          displayId.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.customerPhone.includes(searchLower)
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
  }, [statusFilter, tailorFilter, locationFilter, boxFilter, startDate, endDate, searchQuery, user]);

  // Calculate pagination
  const totalPages = Math.ceil(productions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProductions = productions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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
      if (tailorFilter !== 'all') params.append('tailorId', tailorFilter);
      if (locationFilter !== 'all') params.append('location', locationFilter);
      if (boxFilter !== 'all') params.append('boxId', boxFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`/api/production?${params}`);
      const data = await res.json();
      if (data.success) {
        setProductions(data.data);
        setCurrentPage(1); // Reset to first page when filters change
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

  const fetchBoxes = async () => {
    try {
      const res = await fetch('/api/boxes');
      const data = await res.json();
      if (data.success) {
        setBoxes(data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      if (data.success) {
        setStores(data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openAddModal = () => {
    setEditingProduction(null);
    setFormData({
      orderIdManual: '',
      customerName: '',
      tailorId: '',
      tailoringDate: '',
      isReady: false,
      location: 'godown',
      boxId: '',
      storeId: '',
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
      customerName: production.customerName || '',
      tailorId: production.tailorId?._id || '',
      tailoringDate: production.tailoringDate ? new Date(production.tailoringDate).toISOString().split('T')[0] : '',
      isReady: production.isReady,
      location: production.location || 'godown',
      boxId: production.boxId?._id || '',
      storeId: production.storeId?._id || '',
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
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to save production record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productionId) => {
    if (!confirm('Are you sure you want to delete this production record?')) return;

    try {
      const res = await fetch(`/api/production/${productionId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        await fetchProductions();
      } else {
        alert(data.error || 'Failed to delete production record');
      }
    } catch (error) {
      alert('Failed to delete production record');
    }
  };

  const toggleReady = async (production) => {
    try {
      const res = await fetch(`/api/production/${production._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReady: !production.isReady }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchProductions();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Ready': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Ready': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
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
      {/* Header Section - Mobile Responsive */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Production Tracking</h2>
          <p className="text-sm sm:text-base text-gray-600">Track and manage production workflow</p>
        </div>
        <div className="flex-shrink-0">
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Production</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative col-span-2">
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
            <option value="Not Ready">Not Ready</option>
            <option value="Ready">Ready</option>
          </select>

          <select
            value={tailorFilter}
            onChange={(e) => setTailorFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
          >
            <option value="all">All Tailors</option>
            {tailors.map((tailor, index) => (
              <option key={tailor.id || tailor._id || `tailor-${index}`} value={tailor.id || tailor._id}>{tailor.name}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
          >
            <option value="all">All Locations</option>
            <option value="godown">Godown Store</option>
            <option value="shop">Shop Store</option>
          </select>

          <select
            value={boxFilter}
            onChange={(e) => setBoxFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
          >
            <option value="all">All Boxes</option>
            {boxes.map((box, index) => (
              <option key={box.id || box._id || `box-${index}`} value={box.id || box._id}>{box.name}</option>
            ))}
          </select>

          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${!startDate ? 'opacity-0 absolute inset-0' : ''}`}
              style={{
                colorScheme: 'light'
              }}
            />
            {!startDate && (
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-400 flex items-center justify-between cursor-pointer"
                   onClick={(e) => e.currentTarget.previousElementSibling.showPicker()}>
                <span>Tailoring Date From</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${!endDate ? 'opacity-0 absolute inset-0' : ''}`}
              style={{
                colorScheme: 'light'
              }}
            />
            {!endDate && (
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-400 flex items-center justify-between cursor-pointer"
                   onClick={(e) => e.currentTarget.previousElementSibling.showPicker()}>
                <span>Tailoring Date To</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setStatusFilter('all');
              setTailorFilter('all');
              setLocationFilter('all');
              setBoxFilter('all');
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
            }}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Production Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tailor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Box/Store</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : productions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No production records found</td>
                </tr>
              ) : (
                paginatedProductions.map((production) => (
                  <tr key={production._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{production.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{production.customerName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{production.tailorId?.name || 'Not Assigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {production.tailoringDate ? new Date(production.tailoringDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 capitalize">{production.location || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {production.location === 'godown' && production.storeId?.name ? (
                          <div className="flex items-center gap-1">
                            <StoreIcon className="w-4 h-4" />
                            {production.storeId.name} (Godown)
                          </div>
                        ) : production.location === 'shop' && production.storeId?.name ? (
                          <div className="flex items-center gap-1">
                            <StoreIcon className="w-4 h-4" />
                            {production.storeId.name} (Shop)
                          </div>
                        ) : '-'}
                        {production.boxId?.name && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <BoxIcon className="w-3 h-3" />
                            Box: {production.boxId.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(production.status)}`}>
                        {production.status}
                      </span>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && productions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, productions.length)} of {productions.length} records
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
                  // Show first page, last page, current page, and pages around current
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
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-3xl my-4 md:my-8 max-h-[95vh] md:max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-base md:text-xl font-bold text-gray-900">
                {editingProduction ? 'Edit Production' : 'Add Production'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
                {error && (
                  <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs md:text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select Order <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Custom Autocomplete Search */}
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
                          placeholder="Type to search Order ID, Customer Name, or Phone..."
                          className="w-full pl-11 pr-10 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] focus:border-[#975a20] outline-none text-gray-900 bg-white transition-all placeholder:text-gray-400 font-medium"
                          autoComplete="off"
                        />
                        {orderSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderSearchQuery('');
                              setFormData({ ...formData, orderIdManual: '', customerName: '' });
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
                                      orderIdManual: displayId,
                                      customerName: order.customerName 
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
                                        {order.customerName}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {order.customerPhone}
                                      </p>
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
                          {filteredOrders.length > 10 && (
                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                              Showing 10 of {filteredOrders.length} results. Keep typing to narrow down...
                            </div>
                          )}
                        </div>
                      )}

                      {/* No Results */}
                      {showOrderDropdown && orderSearchQuery && filteredOrders.length === 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-6 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">No orders found</p>
                          <p className="text-xs text-gray-500">Try searching with a different Order ID, name, or phone number</p>
                        </div>
                      )}
                    </div>

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
                            <p className="text-sm font-semibold text-gray-900">{formData.customerName}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, orderIdManual: '', customerName: '' });
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

                    {/* Hidden required input for form validation */}
                    <input
                      type="hidden"
                      value={formData.orderIdManual}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Tailor</label>
                    <select
                      value={formData.tailorId}
                      onChange={(e) => setFormData({ ...formData, tailorId: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    >
                      <option value="">Select Tailor</option>
                      {tailors.map((tailor, index) => (
                        <option key={tailor.id || tailor._id || `tailor-form-${index}`} value={tailor.id || tailor._id}>{tailor.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Tailoring Date</label>
                    <input
                      type="date"
                      value={formData.tailoringDate}
                      onChange={(e) => setFormData({ ...formData, tailoringDate: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Location *</label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value, boxId: '', storeId: '' })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      required
                    >
                      <option value="godown">Godown Store</option>
                      <option value="shop">Shop Store</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    >
                      <option value="Not Ready">Not Ready</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>

                  {formData.location === 'box' && (
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Box</label>
                      <select
                        value={formData.boxId}
                        onChange={(e) => setFormData({ ...formData, boxId: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      >
                        <option value="">Select Box</option>
                        {boxes.map(box => (
                          <option key={box._id} value={box._id}>{box.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.location === 'godown' && (
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Godown Store</label>
                      <select
                        value={formData.storeId}
                        onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      >
                        <option value="">Select Godown Store</option>
                        {stores.filter(s => s.category === 'godown').map(store => (
                          <option key={store._id} value={store._id}>{store.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.location === 'shop' && (
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Shop Store</label>
                      <select
                        value={formData.storeId}
                        onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      >
                        <option value="">Select Shop Store</option>
                        {stores.filter(s => s.category === 'shop').map(store => (
                          <option key={store._id} value={store._id}>{store.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Box (Optional)</label>
                    <select
                      value={formData.boxId}
                      onChange={(e) => setFormData({ ...formData, boxId: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    >
                      <option value="">Select Box</option>
                      {boxes.map(box => (
                        <option key={box._id} value={box._id}>{box.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex gap-2 md:gap-3 p-3 md:p-6 border-t border-gray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingProduction ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
