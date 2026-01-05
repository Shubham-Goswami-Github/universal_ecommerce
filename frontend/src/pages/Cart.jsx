// src/pages/Cart.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);

  // Checkout Steps
  const [currentStep, setCurrentStep] = useState(1);

  // Order Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [checkoutAddress, setCheckoutAddress] = useState({
    fullName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    state: '',
    city: '',
    locality: '',
    addressLine1: '',
    postalCode: '',
    latitude: null,
    longitude: null,
  });

  /* ---------------- CART ---------------- */
  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/cart');
      setCart(res.data.cart || null);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADDRESSES ---------------- */
  const loadSavedAddresses = async () => {
    try {
      const res = await axiosClient.get('/api/addresses');
      setSavedAddresses(res.data.addresses || []);
      const defaultAddress = res.data.addresses?.find(a => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        selectSavedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  useEffect(() => {
    loadCart();
    loadSavedAddresses();
    fetchStates();
  }, []);

  /* ---------------- STATES ---------------- */
  const fetchStates = async () => {
    try {
      const res = await axios.post(
        'https://countriesnow.space/api/v0.1/countries/states',
        { country: 'India' }
      );
      setStates(res.data.data.states || []);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  /* ---------------- CITIES ---------------- */
  const fetchCities = async (state) => {
    try {
      setLoadingCities(true);
      const res = await axios.post(
        'https://countriesnow.space/api/v0.1/countries/state/cities',
        { country: 'India', state }
      );
      setCities(res.data.data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  /* ---------------- AREA AUTOCOMPLETE ---------------- */
  const fetchAreas = async (query) => {
    if (!query || query.length < 3) return;

    try {
      const res = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: `${query}, ${checkoutAddress.city}, India`,
            format: 'json',
            addressdetails: 1,
          },
        }
      );
      setAreas(res.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setCheckoutAddress((prev) => ({ ...prev, [name]: value }));

    if (name === 'state') {
      fetchCities(value);
      setCheckoutAddress((prev) => ({ ...prev, city: '', locality: '' }));
      setCities([]);
    }

    if (name === 'locality') {
      fetchAreas(value);
    }
  };

  const handleAreaSelect = (area) => {
    setCheckoutAddress((prev) => ({
      ...prev,
      locality: area.display_name,
      postalCode: area.address?.postcode || '',
      latitude: area.lat,
      longitude: area.lon,
    }));
    setAreas([]);
  };

  /* ---------------- SELECT SAVED ADDRESS ---------------- */
  const selectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setCheckoutAddress({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      alternatePhone: addr.alternatePhone || '',
      email: addr.email || '',
      state: addr.state || '',
      city: addr.city || '',
      locality: addr.locality || '',
      addressLine1: addr.addressLine1 || '',
      postalCode: addr.postalCode || '',
      latitude: addr.latitude || null,
      longitude: addr.longitude || null,
    });
    if (addr.state) {
      fetchCities(addr.state);
    }
  };

  /* ---------------- UPDATE QUANTITY ---------------- */
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        await axiosClient.delete(`/api/cart/remove/${productId}`);
      } else {
        await axiosClient.put('/api/cart/update', { productId, quantity });
      }
      loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  /* ---------------- REMOVE ITEM ---------------- */
  const removeItem = async (productId) => {
    try {
      await axiosClient.delete(`/api/cart/remove/${productId}`);
      loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  /* ---------------- CHECKOUT ---------------- */
  const checkout = async (e) => {
    e.preventDefault();
    
    try {
      setCheckoutLoading(true);
      const res = await axiosClient.post('/api/orders/checkout', {
        ...checkoutAddress,
        saveAddress,
        paymentMethod,
      });

      setOrderDetails(res.data);
      setShowSuccessModal(true);
      loadCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* ---------------- REDIRECT TO ORDERS ---------------- */
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/orders', { 
      state: { 
        orderSuccess: true,
        orderId: orderDetails?.orderId || orderDetails?.order?._id
      } 
    });
  };

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, it) => sum + (it.product.finalPrice || it.product.sellingPrice) * it.quantity,
    0
  );
  const deliveryCharges = subtotal > 499 ? 0 : 40;
  const totalAmount = subtotal + deliveryCharges;

  // Validate address for next step
  const isAddressValid = () => {
    return (
      checkoutAddress.fullName &&
      checkoutAddress.phone &&
      checkoutAddress.state &&
      checkoutAddress.city &&
      checkoutAddress.addressLine1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-gray-300">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty!</h2>
            <p className="text-gray-500 mb-6">Add items to it now.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-bounce-in shadow-2xl">
            {/* Success Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA'][Math.floor(Math.random() * 5)],
                    width: '10px',
                    height: '10px',
                    borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  }}
                />
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Order Placed Successfully! 🎉
            </h2>
            <p className="text-gray-500 mb-6">
              Thank you for shopping with us! Your order has been confirmed.
            </p>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Order ID</span>
                <span className="font-mono font-semibold text-gray-800">
                  #{(orderDetails?.orderId || orderDetails?.order?._id || 'N/A').toString().slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total Amount</span>
                <span className="font-bold text-green-600 text-lg">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Payment Method</span>
                <span className="font-semibold text-gray-800">Cash on Delivery</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Estimated Delivery</span>
                <span className="font-semibold text-blue-600">3-5 Business Days</span>
              </div>
            </div>

            {/* Delivery Animation */}
            <div className="flex justify-center items-center gap-2 mb-6 text-blue-600">
              <div className="animate-bounce">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                </svg>
              </div>
              <span className="text-sm font-medium animate-pulse">Your order is being prepared!</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSuccessModalClose}
                className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                View Orders
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - Same as before */}
      <div className="min-h-screen bg-gray-100">
        {/* Progress Steps Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center">
                {[
                  { step: 1, label: 'Cart' },
                  { step: 2, label: 'Address' },
                  { step: 3, label: 'Payment' },
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep >= item.step 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > item.step ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          item.step
                        )}
                      </div>
                      <span className={`ml-2 font-medium hidden sm:inline ${
                        currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    
                    {index < 2 && (
                      <div className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 rounded ${
                        currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Section - Steps */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* STEP 1: Cart Items */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer transition ${
                    currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-50'
                  }`}
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep === 1 ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                    }`}>
                      {currentStep > 1 ? '✓' : '1'}
                    </span>
                    <span className="font-semibold">CART ITEMS</span>
                    <span className={`text-sm ${currentStep === 1 ? 'text-blue-200' : 'text-gray-500'}`}>
                      ({items.length} items)
                    </span>
                  </div>
                  {currentStep !== 1 && (
                    <button className="text-sm text-blue-600 font-medium hover:underline">Change</button>
                  )}
                </div>

                {currentStep === 1 && (
                  <div className="p-4">
                    {items.map((item) => (
                      <div key={item._id} className="flex gap-4 py-4 border-b last:border-b-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images?.[0] || '/placeholder.png'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{item.product.name}</h3>
                          <p className="text-xs text-gray-400 mb-2">
                            Seller: {item.product.vendor?.name || 'Official Store'}
                          </p>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl font-bold text-gray-800">₹{item.product.finalPrice || item.product.sellingPrice}</span>
                            {item.product.mrp && item.product.mrp > (item.product.finalPrice || item.product.sellingPrice) && (
                              <>
                                <span className="text-sm text-gray-400 line-through">₹{item.product.mrp}</span>
                                <span className="text-sm text-green-600 font-semibold">
                                  {Math.round(((item.product.mrp - (item.product.finalPrice || item.product.sellingPrice)) / item.product.mrp) * 100)}% off
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition font-semibold"
                              >
                                −
                              </button>
                              <span className="px-4 py-1.5 font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition font-semibold"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.product._id)}
                              className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>

                        <div className="text-right font-bold text-gray-800">
                          ₹{(item.product.finalPrice || item.product.sellingPrice) * item.quantity}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="bg-orange-500 text-white px-12 py-3 rounded-md font-semibold hover:bg-orange-600 transition uppercase"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {currentStep > 1 && (
                  <div className="p-4 bg-gray-50 text-sm text-gray-600">
                    {items.length} items • Subtotal: ₹{subtotal}
                  </div>
                )}
              </div>

              {/* STEP 2: Address */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer transition ${
                    currentStep === 2 ? 'bg-blue-600 text-white' : currentStep > 2 ? 'bg-gray-50' : 'bg-gray-100 text-gray-400'
                  }`}
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep === 2 ? 'bg-white text-blue-600' : currentStep > 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
                    }`}>
                      {currentStep > 2 ? '✓' : '2'}
                    </span>
                    <span className="font-semibold">DELIVERY ADDRESS</span>
                  </div>
                  {currentStep > 2 && (
                    <button className="text-sm text-blue-600 font-medium hover:underline">Change</button>
                  )}
                </div>

                {currentStep === 2 && (
                  <div className="p-4">
                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && !showAddressForm && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">Select Delivery Address</h3>
                        <div className="space-y-3">
                          {savedAddresses.map((addr) => (
                            <label
                              key={addr._id}
                              className={`block border-2 rounded-lg p-4 cursor-pointer transition ${
                                selectedAddressId === addr._id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="savedAddress"
                                  checked={selectedAddressId === addr._id}
                                  onChange={() => selectSavedAddress(addr)}
                                  className="mt-1 w-4 h-4 text-blue-600"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-800">{addr.fullName}</span>
                                    {addr.isDefault && (
                                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Default</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {addr.addressLine1}, {addr.locality}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {addr.city}, {addr.state} - {addr.postalCode}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">Mobile: {addr.phone}</p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setShowAddressForm(true);
                            setSelectedAddressId(null);
                            setCheckoutAddress({
                              fullName: '', phone: '', alternatePhone: '', email: '',
                              state: '', city: '', locality: '', addressLine1: '',
                              postalCode: '', latitude: null, longitude: null,
                            });
                          }}
                          className="mt-4 flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                        >
                          <span className="w-6 h-6 border-2 border-blue-600 rounded-full flex items-center justify-center">+</span>
                          Add New Address
                        </button>
                      </div>
                    )}

                    {/* Address Form */}
                    {(showAddressForm || savedAddresses.length === 0) && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-700 text-sm uppercase">
                            {savedAddresses.length > 0 ? 'Add New Address' : 'Enter Delivery Address'}
                          </h3>
                          {savedAddresses.length > 0 && (
                            <button
                              onClick={() => {
                                setShowAddressForm(false);
                                if (savedAddresses.length > 0) selectSavedAddress(savedAddresses[0]);
                              }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            name="fullName"
                            value={checkoutAddress.fullName}
                            onChange={handleChange}
                            placeholder="Full Name *"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <input
                            name="phone"
                            value={checkoutAddress.phone}
                            onChange={handleChange}
                            placeholder="Mobile Number *"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <input
                            name="alternatePhone"
                            value={checkoutAddress.alternatePhone}
                            onChange={handleChange}
                            placeholder="Alternate Phone"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <input
                            name="email"
                            value={checkoutAddress.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <select
                            name="state"
                            value={checkoutAddress.state}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                          >
                            <option value="">Select State *</option>
                            {states.map((s) => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                          <select
                            name="city"
                            value={checkoutAddress.city}
                            onChange={handleChange}
                            disabled={!checkoutAddress.state}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white disabled:bg-gray-100"
                          >
                            <option value="">{loadingCities ? 'Loading...' : 'Select City *'}</option>
                            {cities.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          
                          <div className="md:col-span-2 relative">
                            <input
                              name="locality"
                              value={checkoutAddress.locality}
                              onChange={handleChange}
                              placeholder="Area / Locality"
                              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            {areas.length > 0 && (
                              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {areas.map((a, i) => (
                                  <div
                                    key={i}
                                    onClick={() => handleAreaSelect(a)}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0"
                                  >
                                    {a.display_name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="md:col-span-2">
                            <textarea
                              name="addressLine1"
                              value={checkoutAddress.addressLine1}
                              onChange={handleChange}
                              placeholder="House No, Building, Street *"
                              rows={3}
                              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            />
                          </div>
                          
                          <input
                            name="postalCode"
                            value={checkoutAddress.postalCode}
                            readOnly
                            placeholder="Pincode (Auto-filled)"
                            className="w-full px-4 py-3 border rounded-lg bg-gray-100"
                          />
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-600">Save this address</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={!isAddressValid()}
                        className={`px-12 py-3 rounded-md font-semibold uppercase transition ${
                          isAddressValid()
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Deliver Here
                      </button>
                    </div>
                  </div>
                )}

                {currentStep > 2 && (
                  <div className="p-4 bg-gray-50 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">{checkoutAddress.fullName}</p>
                    <p>{checkoutAddress.addressLine1}, {checkoutAddress.city}, {checkoutAddress.state} - {checkoutAddress.postalCode}</p>
                  </div>
                )}
              </div>

              {/* STEP 3: Payment */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className={`flex items-center gap-3 p-4 ${
                    currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === 3 ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}>3</span>
                  <span className="font-semibold">PAYMENT</span>
                </div>

                {currentStep === 3 && (
                  <div className="p-4">
                    <div className="space-y-3 mb-6">
                      <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when you receive</p>
                        </div>
                        <span className="text-2xl">💵</span>
                      </label>

                      <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                        <input type="radio" disabled className="w-5 h-5" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">UPI / Cards</p>
                          <p className="text-sm text-gray-500">Coming Soon</p>
                        </div>
                        <span className="text-2xl">💳</span>
                      </label>
                    </div>

                    <button
                      onClick={checkout}
                      disabled={checkoutLoading}
                      className="w-full bg-orange-500 text-white py-4 rounded-md font-semibold hover:bg-orange-600 transition uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        `Confirm Order • ₹${totalAmount}`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm sticky top-24">
                <div className="p-4 border-b">
                  <h2 className="text-gray-500 font-semibold text-sm uppercase">Price Details</h2>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Price ({items.length} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className={deliveryCharges === 0 ? 'text-green-600' : ''}>
                      {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-green-600">₹{totalAmount}</span>
                  </div>
                </div>
                {deliveryCharges === 0 && (
                  <div className="p-4 bg-green-50 border-t text-green-700 text-sm">
                    🎉 You saved ₹40 on delivery!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.4s ease-out; }
        
        @keyframes check {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-check { stroke-dasharray: 100; animation: check 0.5s ease-out 0.2s forwards; }
        
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 3s ease-in-out forwards; }
      `}</style>
    </>
  );
};

export default Cart;