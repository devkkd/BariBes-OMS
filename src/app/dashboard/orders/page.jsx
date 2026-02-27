'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Search, Calendar, IndianRupee, Edit2, Trash2, X, Upload, Image as ImageIcon, Eye, Download } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProduction: 0, ready: 0, delivered: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    orderDate: new Date().toISOString().split('T')[0],
    billingPhoto: '',
    lehengaPhotos: [],
    totalAmount: '',
    firstAdvance: { amount: '', method: 'SHUF' },
    secondAdvance: '',
    deliveryDate: '',
    status: 'Pending',
  });
  const [multipleOrders, setMultipleOrders] = useState([]);
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, orderIdFilter, statusFilter, startDate, endDate, minAmount, maxAmount]);

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter (name and phone only)
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery)
      );
    }

    // Order ID filter
    if (orderIdFilter) {
      filtered = filtered.filter(order => 
        order.orderId && order.orderId.toString().includes(orderIdFilter)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter - both dates required
    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include full end date
        return orderDate >= start && orderDate <= end;
      });
    } else if (startDate) {
      // Only start date - show orders from start date onwards
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= new Date(startDate);
      });
    } else if (endDate) {
      // Only end date - show orders until end date
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate <= end;
      });
    }

    // Amount range filter
    if (minAmount) {
      filtered = filtered.filter(order => order.totalAmount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(order => order.totalAmount <= parseFloat(maxAmount));
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setOrderIdFilter('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingOrder(null);
    setFormData({
      orderId: '',
      customerName: '',
      customerPhone: '',
      orderDate: new Date().toISOString().split('T')[0],
      billingPhoto: '',
      lehengaPhotos: [],
      totalAmount: '',
      firstAdvance: { amount: '', method: 'SHUF' },
      secondAdvance: '',
      deliveryDate: '',
      status: 'Pending',
    });
    setMultipleOrders([]);
    setIsMultipleMode(false);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      orderId: order.orderId || '',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderDate: new Date(order.orderDate).toISOString().split('T')[0],
      billingPhoto: order.billingPhoto,
      lehengaPhotos: order.lehengaPhotos || [],
      totalAmount: order.totalAmount,
      firstAdvance: order.firstAdvance,
      secondAdvance: order.secondAdvance,
      deliveryDate: new Date(order.deliveryDate).toISOString().split('T')[0],
      status: order.status,
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setMultipleOrders([]);
    setIsMultipleMode(false);
    setError('');
  };

  const addAnotherOrder = () => {
    // Validate current order data
    if (!formData.orderId || !formData.customerName || !formData.customerPhone || 
        !formData.billingPhoto || !formData.totalAmount || !formData.firstAdvance.amount || 
        !formData.deliveryDate) {
      setError('Please fill all required fields before adding another order');
      return;
    }

    // Add current order to multiple orders array
    setMultipleOrders([...multipleOrders, { ...formData }]);
    
    // Reset only order-specific fields, keep customer info
    setFormData({
      ...formData,
      billingPhoto: '',
      lehengaPhotos: [],
      totalAmount: '',
      firstAdvance: { amount: '', method: 'SHUF' },
      secondAdvance: '',
      deliveryDate: '',
      status: 'Pending',
    });
    
    setIsMultipleMode(true);
    setError('');
  };

  const removeOrderFromList = (index) => {
    const updated = multipleOrders.filter((_, i) => i !== index);
    setMultipleOrders(updated);
    if (updated.length === 0) {
      setIsMultipleMode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingOrder) {
        // Edit single order
        const url = `/api/orders/${editingOrder.id}`;
        const method = 'PUT';
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            totalAmount: Number(formData.totalAmount),
            firstAdvance: {
              amount: Number(formData.firstAdvance.amount),
              method: formData.firstAdvance.method,
            },
            secondAdvance: Number(formData.secondAdvance || 0),
          }),
        });

        const data = await res.json();

        if (data.success) {
          await fetchOrders();
          closeModal();
        } else {
          setError(data.error || 'Something went wrong');
        }
      } else {
        // Create new order(s)
        const ordersToCreate = isMultipleMode 
          ? [...multipleOrders, formData] 
          : [formData];

        // Set subOrderNumber based on count
        const ordersWithSubNumbers = ordersToCreate.map((order, index) => ({
          ...order,
          subOrderNumber: ordersToCreate.length > 1 ? index + 1 : null, // null for single order
          totalAmount: Number(order.totalAmount),
          firstAdvance: {
            amount: Number(order.firstAdvance.amount),
            method: order.firstAdvance.method,
          },
          secondAdvance: Number(order.secondAdvance || 0),
        }));

        console.log('Orders to create:', ordersWithSubNumbers);

        // Create all orders
        const results = await Promise.all(
          ordersWithSubNumbers.map(order => {
            console.log('Creating order with data:', order);
            return fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(order),
            }).then(res => res.json());
          })
        );

        // Check if all succeeded
        const allSuccess = results.every(r => r.success);
        
        if (allSuccess) {
          await fetchOrders();
          closeModal();
        } else {
          const failedCount = results.filter(r => !r.success).length;
          setError(`${failedCount} order(s) failed to create`);
        }
      }
    } catch (error) {
      setError('Failed to save order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        await fetchOrders();
      } else {
        alert(data.error || 'Failed to delete order');
      }
    } catch (error) {
      alert('Failed to delete order');
    }
  };

  const openViewModal = (order) => {
    setViewingOrder(order);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setViewingOrder(null);
    setShowViewModal(false);
  };

  const downloadReceipt = (order) => {
    const displayOrderId = order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId;
    
    // Create receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Receipt - ${displayOrderId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #975a20; padding-bottom: 20px; }
          .header h1 { color: #975a20; margin: 0; }
          .order-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; color: #975a20; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
          .payment-table { width: 100%; border-collapse: collapse; }
          .payment-table td { padding: 10px; border-bottom: 1px solid #eee; }
          .payment-table .total { font-weight: bold; font-size: 16px; background: #f0f0f0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #666; }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-production { background: #dbeafe; color: #1e40af; }
          .status-ready { background: #d1fae5; color: #065f46; }
          .status-delivered { background: #e5e7eb; color: #374151; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ORDER RECEIPT</h1>
          <p style="margin: 5px 0; color: #666;">Order #${displayOrderId}</p>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="order-info">
            <div class="info-row">
              <span class="label">Customer Name:</span>
              <span class="value">${order.customerName}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone Number:</span>
              <span class="value">${order.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="label">Order Date:</span>
              <span class="value">${new Date(order.orderDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="info-row">
              <span class="label">Delivery Date:</span>
              <span class="value">${new Date(order.deliveryDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <table class="payment-table">
            <tr>
              <td class="label">Total Amount:</td>
              <td class="value" style="text-align: right;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td class="label">First Advance (${order.firstAdvance.method}):</td>
              <td class="value" style="text-align: right; color: #059669;">₹${order.firstAdvance.amount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td class="label">Second Advance:</td>
              <td class="value" style="text-align: right; color: #059669;">₹${order.secondAdvance.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="total">
              <td>Remaining Due:</td>
              <td style="text-align: right; color: #dc2626;">₹${order.remainingDue.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p style="font-size: 12px; margin-top: 10px;">Generated on ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Order-Receipt-${displayOrderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadImage = (imageUrl, fileName) => {
    try {
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'In Production': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready': return 'bg-green-50 text-green-700 border-green-200';
      case 'Delivered': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Mobile Responsive */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Orders Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Track and manage lehenga orders</p>
        </div>
        <div className="flex-shrink-0">
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Production</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProduction}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
              />
            </div>

            <input
              type="text"
              placeholder="Order ID"
              value={orderIdFilter}
              onChange={(e) => setOrderIdFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Production">In Production</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
            </select>

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
                  <span>Order Date From</span>
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
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${!endDate ? 'opacity-0 absolute inset-0' : ''}`}
                style={{
                  colorScheme: 'light'
                }}
              />
              {!endDate && (
                <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-400 flex items-center justify-between cursor-pointer"
                     onClick={(e) => e.currentTarget.previousElementSibling.showPicker()}>
                  <span>Order Date To</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>

            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min ₹"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
            />

            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Max ₹"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
            />

            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>

            <div className="flex items-center justify-end text-xs text-gray-500 md:col-span-2">
              {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Delivery Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Due</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">No orders found</td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(order.firstAdvance.amount + order.secondAdvance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatCurrency(order.remainingDue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(order)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadReceipt(order)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
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
        {!loading && filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingOrder ? 'Edit Order' : 'New Order'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Customer Details Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Customer Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order ID *</label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="e.g., 1, 2, ORD-123"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      required
                      disabled={editingOrder}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Order Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
                    <input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date *</label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Order Images</h4>
                
                <div>
                  <ImageUpload
                    label="Billing Photo *"
                    onUploadComplete={(url) => setFormData({ ...formData, billingPhoto: url })}
                    existingImages={formData.billingPhoto ? [formData.billingPhoto] : []}
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Lehenga Photos (Optional)"
                    multiple={true}
                    onUploadComplete={(urls) => setFormData({ ...formData, lehengaPhotos: urls })}
                    existingImages={formData.lehengaPhotos}
                  />
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Payment Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Advance *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={formData.firstAdvance.amount}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          firstAdvance: { ...formData.firstAdvance, amount: e.target.value }
                        })}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Second Advance</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={formData.secondAdvance}
                        onChange={(e) => setFormData({ ...formData, secondAdvance: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      value={formData.firstAdvance.method}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        firstAdvance: { ...formData.firstAdvance, method: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    >
                      <option value="SHUF">SHUF</option>
                      <option value="VHUF">VHUF</option>
                      <option value="KHUF">KHUF</option>
                      <option value="RD">RD</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Production">In Production</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Multiple Orders List */}
              {!editingOrder && multipleOrders.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Added Orders ({multipleOrders.length})</h4>
                    <span className="text-xs text-green-600 font-medium">✓ Will create as {formData.orderId}-1, {formData.orderId}-2...</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {multipleOrders.map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Order {formData.orderId}-{index + 1}</p>
                          <p className="text-xs text-gray-500">Amount: ₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOrderFromList(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {!editingOrder && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Tip:</strong> {isMultipleMode 
                        ? `Creating ${multipleOrders.length + 1} orders with IDs: ${formData.orderId}-1, ${formData.orderId}-2, ${formData.orderId}-${multipleOrders.length + 1}` 
                        : `Single order will be created with ID: ${formData.orderId}`}
                    </p>
                  </div>
                )}
                
                {!editingOrder && (
                  <button
                    type="button"
                    onClick={addAnotherOrder}
                    disabled={submitting}
                    className="w-full px-4 py-3 border-2 border-dashed border-[#975a20] text-[#975a20] rounded-xl font-medium hover:bg-[#975a20]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Order for Same Customer
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.billingPhoto}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : editingOrder ? 'Update Order' : isMultipleMode ? `Create ${multipleOrders.length + 1} Orders` : 'Create Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && viewingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Order #{viewingOrder.subOrderNumber ? `${viewingOrder.orderId}-${viewingOrder.subOrderNumber}` : viewingOrder.orderId}</p>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                      <p className="text-sm font-medium text-gray-900">{viewingOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">{viewingOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(viewingOrder.orderDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(viewingOrder.deliveryDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(viewingOrder.status)}`}>
                        {viewingOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Payment Details</h4>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-gray-600">Total Amount</span>
                      <span className="text-xs md:text-sm font-semibold text-gray-900">{formatCurrency(viewingOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-gray-600">First Advance ({viewingOrder.firstAdvance.method})</span>
                      <span className="text-xs md:text-sm font-semibold text-green-600">{formatCurrency(viewingOrder.firstAdvance.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-gray-600">Second Advance</span>
                      <span className="text-xs md:text-sm font-semibold text-green-600">{formatCurrency(viewingOrder.secondAdvance)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-gray-300">
                      <span className="text-xs md:text-sm font-semibold text-gray-900">Remaining Due</span>
                      <span className="text-sm md:text-base font-bold text-red-600">{formatCurrency(viewingOrder.remainingDue)}</span>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <h4 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Order Images</h4>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Billing Photo</p>
                        <button
                          onClick={() => downloadImage(viewingOrder.billingPhoto, `Billing-${viewingOrder.orderId}.jpg`)}
                          className="text-xs text-[#975a20] hover:text-[#7d4a1a] font-medium flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                      <img 
                        src={viewingOrder.billingPhoto} 
                        alt="Billing" 
                        className="w-full h-48 md:h-64 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => downloadImage(viewingOrder.billingPhoto, `Billing-${viewingOrder.orderId}.jpg`)}
                      />
                    </div>
                    {viewingOrder.lehengaPhotos && viewingOrder.lehengaPhotos.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">Lehenga Photos ({viewingOrder.lehengaPhotos.length})</p>
                          <button
                            onClick={() => {
                              viewingOrder.lehengaPhotos.forEach((photo, index) => {
                                setTimeout(() => {
                                  downloadImage(photo, `Lehenga-${viewingOrder.orderId}-${index + 1}.jpg`);
                                }, index * 500);
                              });
                            }}
                            className="text-xs text-[#975a20] hover:text-[#7d4a1a] font-medium flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download All
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                          {viewingOrder.lehengaPhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={photo} 
                                alt={`Lehenga ${index + 1}`} 
                                className="w-full h-24 md:h-32 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => downloadImage(photo, `Lehenga-${viewingOrder.orderId}-${index + 1}.jpg`)}
                              />
                              <button
                                onClick={() => downloadImage(photo, `Lehenga-${viewingOrder.orderId}-${index + 1}.jpg`)}
                                className="absolute top-1 right-1 p-1.5 bg-white/90 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <Download className="w-3 h-3 text-[#975a20]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => downloadReceipt(viewingOrder)}
                className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-[#975a20] to-[#7d4a1a] text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
              <button
                onClick={closeViewModal}
                className="flex-1 px-4 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
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
