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
  FileText,
  Plus
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
  const [staffUsers, setStaffUsers] = useState([]);
  
  const [deliveryForm, setDeliveryForm] = useState({
    deliveredDate: new Date().toISOString().split('T')[0],
    deliveredBy: '',
    remainingPaymentAmount: 0,
    paymentMethod: '',
    subPayments: [],
    videoReviewUrl: '',
    deliveryNotes: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStaffUsers();
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

  const fetchStaffUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setStaffUsers(data.users);
    } catch (error) {
      console.error('Error fetching staff:', error);
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
        (order.salesmanName && order.salesmanName.toLowerCase().includes(searchQuery.toLowerCase()))
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
        (order.salesmanName && order.salesmanName.toLowerCase().includes(searchQuery.toLowerCase()))
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
      paymentMethod: '',
      subPayments: [],
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
      errors.deliveredBy = 'Delivered by is required';
    }

    if (!deliveryForm.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }

    if (deliveryForm.paymentMethod === 'Other') {
      const subPayments = deliveryForm.subPayments || [];
      if (subPayments.length === 0) {
        errors.subPayments = 'Please add at least one split payment';
      } else {
        const subTotal = subPayments.reduce((sum, sp) => sum + (Number(sp.amount) || 0), 0);
        const target = Number(deliveryForm.remainingPaymentAmount);
        if (Math.abs(subTotal - target) > 0.01) {
          errors.subPayments = `Split total ₹${subTotal.toLocaleString('en-IN')} must equal ₹${target.toLocaleString('en-IN')}`;
        }
      }
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
          deliveryInfo: {
            ...deliveryForm,
            remainingPaymentAmount: Number(deliveryForm.remainingPaymentAmount),
            subPayments: deliveryForm.paymentMethod === 'Other' ? deliveryForm.subPayments : [],
          },
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
    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const cur = (n) => `&#8377;${Number(n || 0).toLocaleString('en-IN')}`;
    const prod = order.production;

    const firstSubHTML = (order.firstAdvance?.method === 'Other' && order.firstAdvance?.subPayments?.length > 0)
      ? order.firstAdvance.subPayments.map(sp => `<tr style="background:#f0fdf4;"><td style="padding:6px 16px 6px 32px;color:#666;font-size:13px;">&#8627; ${sp.paymentMethod}${sp.name ? ` (${sp.name})` : ''}</td><td style="padding:6px 16px;text-align:right;color:#059669;font-size:13px;">${cur(sp.amount)}</td></tr>`).join('')
      : '';

    const remSubHTML = (order.deliveryInfo?.remainingPaymentMethod === 'Other' && order.deliveryInfo?.remainingPaymentSubPayments?.length > 0)
      ? order.deliveryInfo.remainingPaymentSubPayments.map(sp => `<tr style="background:#f0fdf4;"><td style="padding:6px 16px 6px 32px;color:#666;font-size:13px;">&#8627; ${sp.paymentMethod}${sp.name ? ` (${sp.name})` : ''}</td><td style="padding:6px 16px;text-align:right;color:#059669;font-size:13px;">${cur(sp.amount)}</td></tr>`).join('')
      : '';

    const prodHTML = prod ? `
      <div class="section">
        <div class="section-title">&#9986; Production Details</div>
        <table>
          ${prod.karigarId ? `
            <tr><td class="lbl">Karigar</td><td>${prod.karigarId.name}</td></tr>
            <tr><td class="lbl">Karigar Status</td><td style="color:${prod.karigarStatus === 'Completed' ? '#059669' : '#d97706'};">${prod.karigarStatus}</td></tr>
            ${prod.karigarAssignedDate ? `<tr><td class="lbl">Karigar Assigned</td><td>${fmt(prod.karigarAssignedDate)}</td></tr>` : ''}
            ${prod.karigarNotes ? `<tr><td class="lbl">Karigar Notes</td><td>${prod.karigarNotes}</td></tr>` : ''}
          ` : ''}
          ${prod.tailorId ? `
            <tr><td class="lbl">Tailor</td><td>${prod.tailorId.name}</td></tr>
            <tr><td class="lbl">Tailor Status</td><td style="color:${prod.tailorStatus === 'Completed' ? '#059669' : '#d97706'};">${prod.tailorStatus}</td></tr>
            ${prod.tailoringDate ? `<tr><td class="lbl">Tailoring Date</td><td>${fmt(prod.tailoringDate)}</td></tr>` : ''}
            ${prod.tailorNotes ? `<tr><td class="lbl">Tailor Notes</td><td>${prod.tailorNotes}</td></tr>` : ''}
          ` : ''}
          ${prod.location ? `<tr><td class="lbl">Storage</td><td>${prod.location === 'godown' ? 'Godown' : prod.location === 'shop' ? 'Shop' : 'Showroom'}</td></tr>` : ''}
          ${prod.storeId?.name ? `<tr><td class="lbl">Store</td><td>${prod.storeId.name}</td></tr>` : ''}
          ${prod.boxId?.name ? `<tr><td class="lbl">Box</td><td>${prod.boxId.name}</td></tr>` : ''}
        </table>
      </div>` : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Delivery Receipt - ${order.displayId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:36px;max-width:820px;margin:0 auto;color:#333;font-size:14px}
    .header{text-align:center;margin-bottom:28px;border-bottom:3px solid #975a20;padding-bottom:18px}
    .header h1{color:#975a20;font-size:26px;letter-spacing:2px}
    .header .sub{font-size:16px;color:#555;margin-top:5px}
    .header .gen{font-size:12px;color:#999;margin-top:3px}
    .section{margin-bottom:18px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
    .section-title{font-size:14px;font-weight:bold;color:#fff;background:#975a20;padding:9px 16px}
    table{width:100%;border-collapse:collapse}
    td{padding:9px 16px;border-bottom:1px solid #f0f0f0}
    tr:last-child td{border-bottom:none}
    .lbl{font-weight:bold;color:#444;width:45%}
    .amt{text-align:right;font-weight:bold}
    .green{color:#059669}
    .orange{color:#d97706}
    .footer{text-align:center;margin-top:32px;padding-top:16px;border-top:2px solid #eee;color:#999;font-size:12px}
    @media print{body{padding:16px}}
  </style>
</head>
<body>
  <div class="header">
    <h1>DELIVERY RECEIPT</h1>
    <div class="sub">Order #${order.displayId}</div>
    <div class="gen">Generated: ${new Date().toLocaleString('en-IN')}</div>
  </div>

  <div class="section">
    <div class="section-title">&#128203; Order Information</div>
    <table>
      <tr><td class="lbl">Billing Number</td><td>${order.displayId}</td></tr>
      ${order.salesmanName ? `<tr><td class="lbl">Salesman</td><td>${order.salesmanName}</td></tr>` : ''}
      <tr><td class="lbl">Quantity</td><td>${order.quantity || 1}</td></tr>
      <tr><td class="lbl">Order Date</td><td>${fmt(order.orderDate)}</td></tr>
      <tr><td class="lbl">Expected Delivery</td><td>${fmt(order.deliveryDate)}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">&#128176; Payment Details</div>
    <table>
      <tr><td class="lbl">Total Amount</td><td class="amt">${cur(order.totalAmount)}</td></tr>
      <tr><td class="lbl">1st Advance (${order.firstAdvance?.method || '-'})</td><td class="amt green">${cur(order.firstAdvance?.amount)}</td></tr>
      ${firstSubHTML}
      ${(order.secondAdvance > 0) ? `<tr><td class="lbl">2nd Advance</td><td class="amt green">${cur(order.secondAdvance)}</td></tr>` : ''}
      <tr style="background:#fff8e1;"><td class="lbl orange">Remaining Due</td><td class="amt orange">${cur(order.remainingDue)}</td></tr>
    </table>
  </div>

  ${prodHTML}

  <div class="section">
    <div class="section-title">&#128666; Delivery Information</div>
    <table>
      <tr><td class="lbl">Delivered Date</td><td>${fmt(order.deliveryInfo?.deliveredDate)}</td></tr>
      <tr><td class="lbl">Delivered By</td><td>${order.deliveryInfo?.deliveredBy || '-'}</td></tr>
      <tr><td class="lbl">Payment Collected</td><td class="amt green">${cur(order.deliveryInfo?.remainingPaymentAmount)}</td></tr>
      <tr><td class="lbl">Payment Method</td><td>${order.deliveryInfo?.remainingPaymentMethod || '-'}</td></tr>
      ${remSubHTML}
      ${order.deliveryInfo?.deliveryNotes ? `<tr><td class="lbl">Notes</td><td>${order.deliveryInfo.deliveryNotes}</td></tr>` : ''}
      ${order.deliveryInfo?.videoReviewUrl ? `<tr><td class="lbl">Video Review</td><td><a href="${order.deliveryInfo.videoReviewUrl}" target="_blank" style="color:#975a20;">Watch Video</a></td></tr>` : ''}
    </table>
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
  </div>
</body>
</html>`;
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
                          <p className="text-xs text-gray-500 mb-1">Qty</p>
                          <p className="text-sm font-semibold text-gray-900">{order.quantity || 1}</p>
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
                          <p className="text-sm font-medium text-gray-900 truncate">{order.displayId}</p>
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
                        <div>
                          <span className="text-gray-500">Delivered By: </span>
                          <span className="text-gray-900 font-medium">{order.deliveryInfo.deliveredBy}</span>
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
                {selectedOrder.salesmanName && (
                  <p className="text-sm text-gray-600">Salesman: <span className="font-semibold text-gray-900">{selectedOrder.salesmanName}</span></p>
                )}
                <p className="text-sm text-gray-600">Quantity: <span className="font-semibold text-gray-900">{selectedOrder.quantity || 1}</span></p>
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
                  <select
                    value={deliveryForm.deliveredBy}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveredBy: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${
                      formErrors.deliveredBy ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Staff</option>
                    {staffUsers.map((staff) => (
                      <option key={staff.id} value={staff.name}>{staff.name}</option>
                    ))}
                  </select>
                  {formErrors.deliveredBy && <p className="text-xs text-red-500 mt-1">{formErrors.deliveredBy}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Remaining Payment <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={deliveryForm.remainingPaymentAmount}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, remainingPaymentAmount: e.target.value, subPayments: [] })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryForm.paymentMethod}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, paymentMethod: e.target.value, subPayments: [] })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900 ${formErrors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="SHUF">SHUF</option>
                    <option value="VHUF">VHUF</option>
                    <option value="KHUF">KHUF</option>
                    <option value="RD">RD</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other (Split Payment)</option>
                  </select>
                  {formErrors.paymentMethod && <p className="text-xs text-red-500 mt-1">{formErrors.paymentMethod}</p>}
                </div>
              </div>

              {/* Split Payment Section */}
              {deliveryForm.paymentMethod === 'Other' && Number(deliveryForm.remainingPaymentAmount) > 0 && (
                <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-black">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-900">
                      Split ₹{Number(deliveryForm.remainingPaymentAmount).toLocaleString('en-IN')} into parts
                    </label>
                    <button
                      type="button"
                      onClick={() => setDeliveryForm({
                        ...deliveryForm,
                        subPayments: [...(deliveryForm.subPayments || []), { paymentMethod: '', name: '', amount: '' }]
                      })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#975a20] text-white text-xs rounded-lg hover:opacity-90"
                    >
                      <Plus className="w-3 h-3" />
                      Add Payment
                    </button>
                  </div>

                  {(deliveryForm.subPayments || []).length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {deliveryForm.subPayments.map((sp, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white rounded-lg border border-gray-200">
                          <select
                            value={sp.paymentMethod || ''}
                            onChange={(e) => {
                              const updated = [...deliveryForm.subPayments];
                              updated[index] = { ...updated[index], paymentMethod: e.target.value };
                              setDeliveryForm({ ...deliveryForm, subPayments: updated });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none text-gray-900"
                          >
                            <option value="">Payment Method</option>
                            <option value="Cash">Cash</option>
                            <option value="Online">Online</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Person Name"
                            value={sp.name || ''}
                            onChange={(e) => {
                              const updated = [...deliveryForm.subPayments];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setDeliveryForm({ ...deliveryForm, subPayments: updated });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none"
                          />
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={sp.amount || ''}
                                onChange={(e) => {
                                  const updated = [...deliveryForm.subPayments];
                                  updated[index] = { ...updated[index], amount: e.target.value };
                                  setDeliveryForm({ ...deliveryForm, subPayments: updated });
                                }}
                                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#975a20] outline-none"
                                min="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = deliveryForm.subPayments.filter((_, i) => i !== index);
                                setDeliveryForm({ ...deliveryForm, subPayments: updated });
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(deliveryForm.subPayments || []).length > 0 && (() => {
                    const subTotal = deliveryForm.subPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                    const target = Number(deliveryForm.remainingPaymentAmount);
                    const isMatching = Math.abs(subTotal - target) < 0.01;
                    const diff = target - subTotal;
                    return (
                      <div className={`p-3 rounded-lg border-2 ${isMatching ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Sub-payments Total:</span>
                          <span className={`text-lg font-bold ${isMatching ? 'text-green-700' : 'text-red-700'}`}>₹{subTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-semibold text-gray-700">Target:</span>
                          <span className="text-lg font-bold text-gray-900">₹{target.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="pt-2 border-t mt-2">
                          <p className={`text-sm font-bold flex items-center gap-2 ${isMatching ? 'text-green-700' : 'text-red-700'}`}>
                            {isMatching ? '✓ Amounts match perfectly!' : diff > 0 ? `⚠️ Need ₹${diff.toLocaleString('en-IN')} more` : `⚠️ Exceeded by ₹${Math.abs(diff).toLocaleString('en-IN')}`}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                  {formErrors.subPayments && <p className="text-xs text-red-500">{formErrors.subPayments}</p>}
                </div>
              )}

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
