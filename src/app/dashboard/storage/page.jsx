'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, Edit2, X, MapPin, Box as BoxIcon, Store as StoreIcon, CheckCircle, User, Download, Calendar } from 'lucide-react';
import MobileBackButton from '@/components/MobileBackButton';

export default function StoragePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [productions, setProductions] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filters
  const [locationFilter, setLocationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    location: 'godown',
    boxId: '',
    storeId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchBoxes();
    fetchStores();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReadyProductions();
    }
  }, [locationFilter, searchQuery, user]);

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

  const fetchReadyProductions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Fetch only productions where tailor status is Completed
      params.append('tailorStatus', 'Completed');
      if (locationFilter !== 'all') params.append('location', locationFilter);
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

  const openStorageModal = (production) => {
    setSelectedProduction(production);
    setFormData({
      location: production.location || 'godown',
      boxId: production.boxId?._id || '',
      storeId: production.storeId?._id || '',
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduction(null);
    setError('');
  };

  const openOrderModal = async (production) => {
    try {
      // Fetch order details
      const orderParts = production.orderNumber.split('-');
      const orderId = orderParts[0];
      const subOrderNumber = orderParts.length > 1 ? parseInt(orderParts[1]) : null;
      
      const params = new URLSearchParams();
      params.append('orderId', orderId);
      if (subOrderNumber !== null) {
        params.append('subOrderNumber', subOrderNumber);
      }
      
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      
      if (data.success && data.orders && data.orders.length > 0) {
        // Attach production details to order
        setSelectedOrder({
          ...data.orders[0],
          production: production
        });
        setShowOrderModal(true);
      } else {
        alert('Order details not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to fetch order details');
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/production/${selectedProduction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        await fetchReadyProductions();
        closeModal();
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to update storage location');
    } finally {
      setSubmitting(false);
    }
  };

  // Sort productions by date (newest first) and then by billing number (descending)
  const sortedProductions = [...productions].sort((a, b) => {
    // First sort by tailoring completion date (newest first)
    const dateA = new Date(a.tailoringDate || a.createdAt);
    const dateB = new Date(b.tailoringDate || b.createdAt);
    
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
      const date = new Date(production.tailoringDate || production.createdAt);
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Storage Assignment</h2>
          <p className="text-sm sm:text-base text-gray-600">Assign storage location to tailor-completed items</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-200">
          <div className="text-xs text-gray-600">Ready Items</div>
          <div className="text-2xl font-bold text-gray-900">{productions.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
          >
            <option value="all">All Locations</option>
            <option value="godown">Godown Store</option>
            <option value="shop">Shop Store</option>
            <option value="showroom">Showroom</option>
            <option value="">Not Assigned</option>
          </select>
        </div>
      </div>

      {/* Production Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Billing Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Salesman</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tailor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Storage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : paginatedProductions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-medium mb-1">No items ready for storage</p>
                      <p className="text-sm text-gray-500">
                        Items will appear here when tailor marks them as completed
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedProductions).map(([date, productions]) => (
                  <React.Fragment key={`date-group-${date}`}>
                    {/* Date Header Row */}
                    <tr key={`date-${date}`} className="bg-gradient-to-r from-[#975a20]/10 to-[#7d4a1a]/10">
                      <td colSpan="6" className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#975a20]" />
                          <span className="text-sm font-bold text-[#975a20]">{date}</span>
                          <span className="text-xs text-gray-600">({productions.length} item{productions.length > 1 ? 's' : ''})</span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Productions for this date */}
                    {productions.map((production) => (
                  <tr key={production._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{production.orderNumber}</span>
                        <button
                          onClick={() => openOrderModal(production)}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          title="View Order Details"
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{production.salesmanName || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{production.tailorId?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {production.location ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                          production.location === 'godown' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : production.location === 'shop'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {production.location === 'godown' ? 'Godown' : production.location === 'shop' ? 'Shop' : 'Showroom'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {production.storeId?.name ? (
                          <div className="flex items-center gap-1">
                            <StoreIcon className="w-4 h-4" />
                            {production.storeId.name}
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
                      <button
                        onClick={() => openStorageModal(production)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        title="Assign Storage"
                      >
                        <MapPin className="w-4 h-4" />
                        {production.location ? 'Update' : 'Assign'}
                      </button>
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

      {/* Storage Assignment Modal */}
      {showModal && selectedProduction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Assign Storage Location</h3>
                <p className="text-sm text-gray-500 mt-1">Order: {selectedProduction.orderNumber}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                  required
                >
                  <option value="godown">Godown Store</option>
                  <option value="shop">Shop Store</option>
                  <option value="showroom">Showroom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Box (Optional)</label>
                <select
                  value={formData.boxId}
                  onChange={(e) => setFormData({ ...formData, boxId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                >
                  <option value="">Select Box</option>
                  {boxes.map(box => (
                    <option key={box._id} value={box._id}>{box.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
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
                  {submitting ? 'Saving...' : 'Assign Storage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedOrder.subOrderNumber 
                    ? `${selectedOrder.orderId}-${selectedOrder.subOrderNumber}` 
                    : selectedOrder.orderId}
                </p>
              </div>
              <button onClick={closeOrderModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Production Information */}
              {selectedOrder.production && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Production Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Karigar Details */}
                    {selectedOrder.production.karigarId && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Karigar</p>
                        <p className="font-medium text-gray-900">{selectedOrder.production.karigarId.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedOrder.production.karigarStatus === 'Completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedOrder.production.karigarStatus}
                          </span>
                          {selectedOrder.production.karigarAssignedDate && (
                            <span className="text-xs text-gray-500">
                              {new Date(selectedOrder.production.karigarAssignedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {selectedOrder.production.karigarNotes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{selectedOrder.production.karigarNotes}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Tailor Details */}
                    {selectedOrder.production.tailorId && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Tailor</p>
                        <p className="font-medium text-gray-900">{selectedOrder.production.tailorId.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedOrder.production.tailorStatus === 'Completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedOrder.production.tailorStatus}
                          </span>
                          {selectedOrder.production.tailoringDate && (
                            <span className="text-xs text-gray-500">
                              {new Date(selectedOrder.production.tailoringDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {selectedOrder.production.tailorNotes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{selectedOrder.production.tailorNotes}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Storage Details */}
                    {selectedOrder.production.location && (
                      <div className="bg-white/50 rounded-lg p-3 col-span-2">
                        <p className="text-xs text-gray-600 mb-2">Storage Location</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            <MapPin className="w-3 h-3" />
                            {selectedOrder.production.location === 'godown' ? 'Godown' : 
                             selectedOrder.production.location === 'shop' ? 'Shop' : 'Showroom'}
                          </span>
                          {selectedOrder.production.storeId?.name && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <StoreIcon className="w-3 h-3" />
                              {selectedOrder.production.storeId.name}
                            </span>
                          )}
                          {selectedOrder.production.boxId?.name && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              <BoxIcon className="w-3 h-3" />
                              {selectedOrder.production.boxId.name}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedOrder.salesmanName && (
                    <div>
                      <p className="text-xs text-gray-600">Salesman</p>
                      <p className="font-medium text-gray-900">{selectedOrder.salesmanName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600">Salesman</p>
                    <p className="font-medium text-gray-900">{selectedOrder.salesmanName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-green-200">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg text-gray-900">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                  
                  {/* First Advance with Sub Payments */}
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">First Advance</span>
                      <span className="font-semibold text-gray-900">₹{selectedOrder.firstAdvance?.amount?.toLocaleString()}</span>
                    </div>
                    {selectedOrder.firstAdvance?.method && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="font-medium text-gray-700">{selectedOrder.firstAdvance.method}</span>
                        </div>
                        {selectedOrder.firstAdvance.subPayments && selectedOrder.firstAdvance.subPayments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5">
                            <p className="text-xs font-medium text-gray-600 mb-1">Payment Breakdown:</p>
                            {selectedOrder.firstAdvance.subPayments.map((payment, index) => (
                              <div key={index} className="flex justify-between items-center text-xs bg-white/70 rounded px-2 py-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">• {payment.paymentMethod}</span>
                                  {payment.name && (
                                    <span className="text-gray-500 text-[10px]">({payment.name})</span>
                                  )}
                                </div>
                                <span className="font-medium text-gray-700">₹{payment.amount?.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Second Advance */}
                  {selectedOrder.secondAdvance > 0 && (
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Second Advance</span>
                          {selectedOrder.secondAdvanceDate && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(selectedOrder.secondAdvanceDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">₹{selectedOrder.secondAdvance?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="text-sm font-medium text-gray-700">Remaining Due</span>
                    <span className="font-bold text-red-600">₹{selectedOrder.remainingDue?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                <h4 className="font-semibold text-gray-900 mb-3">Delivery Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Delivery Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      selectedOrder.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                      selectedOrder.status === 'In Production' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Images */}
              {(selectedOrder.billingPhoto || selectedOrder.lehengaPhotos?.length > 0) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Order Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedOrder.billingPhoto && (
                      <div className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={selectedOrder.billingPhoto} 
                            alt="Billing" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2">
                            Billing Photo
                          </div>
                        </div>
                        <a
                          href={selectedOrder.billingPhoto}
                          download={`billing-${selectedOrder.orderId}.jpg`}
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-gray-700" />
                        </a>
                      </div>
                    )}
                    {selectedOrder.lehengaPhotos?.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={photo} 
                            alt={`Lehenga ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2">
                            Lehenga Photo {index + 1}
                          </div>
                        </div>
                        <a
                          href={photo}
                          download={`lehenga-${selectedOrder.orderId}-${index + 1}.jpg`}
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-gray-700" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200">
              <button
                onClick={closeOrderModal}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
