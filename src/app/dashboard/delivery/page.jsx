'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  Package, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  IndianRupee,
  CheckCircle,
  Download,
  X,
  Loader2,
  FileText
} from 'lucide-react';
import MobileBackButton from '@/components/MobileBackButton';
import VideoUpload from '@/components/VideoUpload';

export default function DeliveryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ready');
  
  const [readyOrders, setReadyOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [filteredReadyOrders, setFilteredReadyOrders] = useState([]);
  const [filteredDeliveredOrders, setFilteredDeliveredOrders] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [stats, setStats] = useState({
    readyCount: 0,
    deliveredToday: 0,
    totalDelivered: 0,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  const [deliveryForm, setDeliveryForm] = useState({
    deliveredDate: new Date().toISOString().split('T')[0],
    deliveredBy: '',
    remainingPaymentAmount: 0,
    deliveryPersonName: '',
    deliveryPersonMobile: '',
    videoReviewUrl: '',
    deliveryNotes: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'ready') {
        fetchReadyOrders();
      } else {
        fetchDeliveredOrders();
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    applyFilters();
  }, [readyOrders, deliveredOrders, searchQuery, startDate, endDate]);

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

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/delivery/ready');
      const data = await res.json();
      
      if (data.success) {
        setReadyOrders(data.orders);
        setStats(prev => ({ ...prev, readyCount: data.count }));
      }
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      showNotification('Failed to load ready orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveredOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/delivery/delivered');
      const data = await res.json();
      
      if (data.success) {
        setDeliveredOrders(data.orders);
        setStats(prev => ({
          ...prev,
          deliveredToday: data.stats.deliveredToday,
          totalDelivered: data.stats.totalDelivered,
        }));
      }
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
      showNotification('Failed to load delivered orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Filter ready orders
    let filteredReady = [...readyOrders];
    if (searchQuery) {
      filteredReady = filteredReady.filter(order =>
        order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (startDate && endDate) {
      filteredReady = filteredReady.filter(order => {
        const orderDate = new Date(order.deliveryDate);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
    }
    setFilteredReadyOrders(filteredReady);

    // Filter delivered orders
    let filteredDelivered = [...deliveredOrders];
    if (searchQuery) {
      filteredDelivered = filteredDelivered.filter(order =>
        order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (startDate && endDate) {
      filteredDelivered = filteredDelivered.filter(order => {
        if (!order.deliveryInfo?.deliveredDate) return false;
        const deliveredDate = new Date(order.deliveryInfo.deliveredDate);
        return deliveredDate >= new Date(startDate) && deliveredDate <= new Date(endDate);
      });
    }
    setFilteredDeliveredOrders(filteredDelivered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Calculate pagination based on active tab
  const currentOrders = activeTab === 'ready' ? filteredReadyOrders : filteredDeliveredOrders;
  const totalPages = Math.ceil(currentOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = currentOrders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const openDeliveryModal = (order) => {
    setSelectedOrder(order);
    setDeliveryForm({
      deliveredDate: new Date().toISOString().split('T')[0],
      deliveredBy: '',
      remainingPaymentAmount: order.remainingDue,
      deliveryPersonName: '',
      deliveryPersonMobile: '',
      videoReviewUrl: '',
      deliveryNotes: '',
    });
    setFormErrors({});
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setFormErrors({});
    setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!deliveryForm.deliveredDate) {
      errors.deliveredDate = 'Delivered date is required';
    }
    
    if (!deliveryForm.deliveredBy || deliveryForm.deliveredBy.trim().length < 2) {
      errors.deliveredBy = 'Delivered by is required (minimum 2 characters)';
    }
    
    if (!deliveryForm.deliveryPersonName || deliveryForm.deliveryPersonName.trim().length < 2) {
      errors.deliveryPersonName = 'Delivery person name is required (minimum 2 characters)';
    }
    
    if (!deliveryForm.deliveryPersonMobile) {
      errors.deliveryPersonMobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(deliveryForm.deliveryPersonMobile)) {
      errors.deliveryPersonMobile = 'Invalid phone number (10 digits, starting with 6-9)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitDelivery = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/delivery/mark-delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          deliveryInfo: deliveryForm,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('Order marked as delivered successfully!', 'success');
        closeModal();
        fetchReadyOrders();
        fetchDeliveredOrders();
      } else {
        setError(data.error || 'Failed to mark order as delivered');
      }
    } catch (error) {
      setError('Failed to mark order as delivered');
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    if (type === 'success') {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const downloadReceipt = (order) => {
    const receiptHTML = generateReceiptHTML(order);
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Delivery-Receipt-${order.displayId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReceiptHTML = (order) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Delivery Receipt - ${order.displayId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #975a20; padding-bottom: 20px; }
          .header h1 { color: #975a20; margin: 0; }
          .section { margin-bottom: 25px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .section-title { font-size: 18px; font-weight: bold; color: #975a20; margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #666; }
          .video-link { display: inline-block; margin-top: 10px; padding: 8px 16px; background: #975a20; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DELIVERY RECEIPT</h1>
          <p>Order #${order.displayId}</p>
        </div>
        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="info-row"><span class="label">Name:</span><span class="value">${order.customerName}</span></div>
          <div class="info-row"><span class="label">Phone:</span><span class="value">${order.customerPhone}</span></div>
        </div>
        <div class="section">
          <div class="section-title">Delivery Information</div>
          <div class="info-row"><span class="label">Delivered Date:</span><span class="value">${new Date(order.deliveryInfo.deliveredDate).toLocaleDateString('en-IN')}</span></div>
          <div class="info-row"><span class="label">Delivered By:</span><span class="value">${order.deliveryInfo.deliveredBy}</span></div>
          <div class="info-row"><span class="label">Delivery Person:</span><span class="value">${order.deliveryInfo.deliveryPersonName}</span></div>
          <div class="info-row"><span class="label">Contact:</span><span class="value">${order.deliveryInfo.deliveryPersonMobile}</span></div>
          ${order.deliveryInfo.deliveryNotes ? `<div class="info-row"><span class="label">Notes:</span><span class="value">${order.deliveryInfo.deliveryNotes}</span></div>` : ''}
          ${order.deliveryInfo.videoReviewUrl ? `
            <div class="info-row">
              <span class="label">Video Review:</span>
              <span class="value">
                <a href="${order.deliveryInfo.videoReviewUrl}" target="_blank" class="video-link">Watch Video Review</a>
              </span>
            </div>
          ` : ''}
        </div>
        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="info-row"><span class="label">Total Amount:</span><span class="value">₹${order.totalAmount.toLocaleString('en-IN')}</span></div>
          <div class="info-row"><span class="label">Remaining Payment:</span><span class="value">₹${order.deliveryInfo.remainingPaymentAmount.toLocaleString('en-IN')}</span></div>
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="font-size: 12px;">Generated on ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </body>
      </html>
    `;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#975a20] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
    


  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center gap-2`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span>{notification.message}</span>
          {notification.type === 'error' && (
            <button onClick={() => setNotification(null)} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <MobileBackButton />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Delivery Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Track and manage order deliveries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Ready for Delivery</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.readyCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Delivered Today</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.deliveredToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Total Delivered</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalDelivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Billing Number or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${!startDate ? 'opacity-0 absolute inset-0' : ''}`}
              style={{
                colorScheme: 'light'
              }}
            />
            {!startDate && (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-400 flex items-center justify-between cursor-pointer"
                   onClick={(e) => e.currentTarget.previousElementSibling.showPicker()}>
                <span className="truncate">{activeTab === 'ready' ? 'Delivery From' : 'Delivered From'}</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${!endDate ? 'opacity-0 absolute inset-0' : ''}`}
              style={{
                colorScheme: 'light'
              }}
            />
            {!endDate && (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-400 flex items-center justify-between cursor-pointer"
                   onClick={(e) => e.currentTarget.previousElementSibling.showPicker()}>
                <span className="truncate">{activeTab === 'ready' ? 'Delivery To' : 'Delivered To'}</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('ready'); setCurrentPage(1); }}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'ready'
                  ? 'bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Ready for Delivery ({filteredReadyOrders.length})</span>
              <span className="sm:hidden">Ready ({filteredReadyOrders.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('delivered'); setCurrentPage(1); }}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'delivered'
                  ? 'bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Delivered Orders ({filteredDeliveredOrders.length})</span>
              <span className="sm:hidden">Delivered ({filteredDeliveredOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#975a20]" />
            </div>
          ) : activeTab === 'ready' ? (
            // Ready Orders
            <div className="space-y-3 sm:space-y-4">
              {filteredReadyOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No orders ready for delivery</p>
                </div>
              ) : (
                paginatedOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Billing Number</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{order.displayId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                          <p className="text-xs text-gray-500 truncate">{order.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                          <p className="text-sm text-gray-900">{new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Amount Due</p>
                          <p className="text-sm font-semibold text-red-600">{formatCurrency(order.remainingDue)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openDeliveryModal(order)}
                        className="w-full sm:w-auto sm:ml-4 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shrink-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Mark Delivered</span>
                        <span className="sm:hidden">Mark</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Delivered Orders
            <div className="space-y-3 sm:space-y-4">
              {filteredDeliveredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No delivered orders</p>
                </div>
              ) : (
                paginatedOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Billing Number</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{order.displayId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Delivered Date</p>
                          <p className="text-sm text-gray-900">
                            {order.deliveryInfo?.deliveredDate 
                              ? new Date(order.deliveryInfo.deliveredDate).toLocaleDateString('en-IN')
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Delivered By</p>
                          <p className="text-sm text-gray-900 truncate">{order.deliveryInfo?.deliveredBy || '-'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadReceipt(order)}
                        className="w-full sm:w-auto sm:ml-4 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span>Receipt</span>
                      </button>
                    </div>
                    {order.deliveryInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs">
                        <div className="truncate">
                          <span className="text-gray-500">Delivery Person: </span>
                          <span className="text-gray-900 font-medium">{order.deliveryInfo.deliveryPersonName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Contact: </span>
                          <span className="text-gray-900 font-medium">{order.deliveryInfo.deliveryPersonMobile}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Payment Collected: </span>
                          <span className="text-gray-900 font-medium">{formatCurrency(order.deliveryInfo.remainingPaymentAmount)}</span>
                        </div>
                        {order.deliveryInfo.videoReviewUrl && (
                          <div className="md:col-span-3">
                            <span className="text-gray-500">Video Review: </span>
                            <a 
                              href={order.deliveryInfo.videoReviewUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#975a20] hover:underline font-medium inline-flex items-center gap-1"
                            >
                              Watch Video
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && currentOrders.length > 0 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(endIndex, currentOrders.length)} of {currentOrders.length} orders
            </div>
            <div className="flex items-center gap-2 text-black">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
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
                        className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white font-semibold'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1 sm:px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Mark Order as Delivered</h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelivery} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Order: <span className="font-semibold text-gray-900">{selectedOrder.displayId}</span></p>
                <p className="text-sm text-gray-600">Customer: <span className="font-semibold text-gray-900">{selectedOrder.customerName}</span></p>
                <p className="text-sm text-gray-600">Amount Due: <span className="font-semibold text-red-600">{formatCurrency(selectedOrder.remainingDue)}</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Delivered Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={deliveryForm.deliveredDate}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveredDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${
                      formErrors.deliveredDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.deliveredDate && <p className="text-xs text-red-500 mt-1">{formErrors.deliveredDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Delivered By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.deliveredBy}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveredBy: e.target.value })}
                    placeholder="Staff name who handed over"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${
                      formErrors.deliveredBy ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.deliveredBy && <p className="text-xs text-red-500 mt-1">{formErrors.deliveredBy}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Remaining Payment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={deliveryForm.remainingPaymentAmount}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, remainingPaymentAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Delivery Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.deliveryPersonName}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPersonName: e.target.value })}
                    placeholder="Person who delivered"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${
                      formErrors.deliveryPersonName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.deliveryPersonName && <p className="text-xs text-red-500 mt-1">{formErrors.deliveryPersonName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Delivery Person Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={deliveryForm.deliveryPersonMobile}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPersonMobile: e.target.value })}
                    placeholder="10 digit mobile number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${
                      formErrors.deliveryPersonMobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.deliveryPersonMobile && <p className="text-xs text-red-500 mt-1">{formErrors.deliveryPersonMobile}</p>}
                </div>
              </div>

              <div>
                <VideoUpload
                  label="Video Review (Optional)"
                  existingVideo={deliveryForm.videoReviewUrl}
                  onUploadComplete={(url) => setDeliveryForm({ ...deliveryForm, videoReviewUrl: url })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={deliveryForm.deliveryNotes}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">{deliveryForm.deliveryNotes.length}/500 characters</p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mark as Delivered
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
