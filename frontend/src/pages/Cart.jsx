// src/pages/Cart.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import axios from 'axios';

// 🔑 Get your free API key from: https://countrystatecity.in/
// Sign up (no credit card needed) and paste your key here
const CSC_API_KEY = '2eece9693599fe77ccdab2a71cbc1c71d218c51638b8e98f541629d6fb206227'; // Replace with your actual key

const Cart = () => {
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [areaSearchTimeout, setAreaSearchTimeout] = useState(null);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [checkoutAddress, setCheckoutAddress] = useState({
    fullName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    state: '',
    stateCode: '', // Store state ISO code for city API
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

  /* ---------------- STATES (CountryStateCity API) ---------------- */
  const fetchStates = async () => {
    try {
      const res = await axios.get(
        'https://api.countrystatecity.in/v1/countries/IN/states',
        {
          headers: {
            'X-CSCAPI-KEY': CSC_API_KEY
          }
        }
      );
      // Sort states alphabetically
      const sortedStates = (res.data || []).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setStates(sortedStates);
    } catch (error) {
      console.error('Error fetching states:', error);
      // Fallback to basic list if API fails
      setStates([]);
    }
  };

  /* ---------------- CITIES (CountryStateCity API) ---------------- */
  const fetchCities = async (stateCode) => {
    if (!stateCode) return;
    
    try {
      setLoadingCities(true);
      const res = await axios.get(
        `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
        {
          headers: {
            'X-CSCAPI-KEY': CSC_API_KEY
          }
        }
      );
      // Sort cities alphabetically
      const sortedCities = (res.data || []).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setCities(sortedCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  /* ---------------- AREAS (Indian Postal PIN Code API) ---------------- */
  const fetchAreas = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setAreas([]);
      return;
    }

    try {
      setLoadingAreas(true);
      const res = await axios.get(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`
      );

      if (res.data?.[0]?.Status === 'Success') {
        let postOffices = res.data[0].PostOffice || [];
        
        // Filter by selected state/city if available
        if (checkoutAddress.state) {
          postOffices = postOffices.filter(po => 
            po.State?.toLowerCase() === checkoutAddress.state.toLowerCase()
          );
        }
        
        if (checkoutAddress.city) {
          const cityLower = checkoutAddress.city.toLowerCase();
          postOffices = postOffices.filter(po => 
            po.District?.toLowerCase().includes(cityLower) ||
            po.Division?.toLowerCase().includes(cityLower) ||
            po.Region?.toLowerCase().includes(cityLower)
          );
        }
        
        // Remove duplicates based on Name
        const uniqueAreas = postOffices.reduce((acc, current) => {
          const x = acc.find(item => item.Name === current.Name);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        setAreas(uniqueAreas.slice(0, 10)); // Limit to 10 results
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }, [checkoutAddress.state, checkoutAddress.city]);

  /* ---------------- FETCH PINCODE BY AREA (Alternative) ---------------- */
  const fetchPincodeByArea = async (areaName) => {
    try {
      const res = await axios.get(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(areaName)}`
      );
      
      if (res.data?.[0]?.Status === 'Success' && res.data[0].PostOffice?.length > 0) {
        return res.data[0].PostOffice[0].Pincode;
      }
      return null;
    } catch (error) {
      console.error('Error fetching pincode:', error);
      return null;
    }
  };

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'state') {
      // Find the selected state to get its ISO code
      const selectedState = states.find(s => s.name === value);
      setCheckoutAddress((prev) => ({ 
        ...prev, 
        [name]: value,
        stateCode: selectedState?.iso2 || '',
        city: '', 
        locality: '',
        postalCode: ''
      }));
      setCities([]);
      setAreas([]);
      if (selectedState?.iso2) {
        fetchCities(selectedState.iso2);
      }
      return;
    }

    if (name === 'city') {
      setCheckoutAddress((prev) => ({ 
        ...prev, 
        [name]: value,
        locality: '',
        postalCode: ''
      }));
      setAreas([]);
      return;
    }

    if (name === 'locality') {
      setCheckoutAddress((prev) => ({ ...prev, [name]: value }));
      
      // Debounce the area search
      if (areaSearchTimeout) {
        clearTimeout(areaSearchTimeout);
      }
      
      const timeout = setTimeout(() => {
        fetchAreas(value);
      }, 500);
      
      setAreaSearchTimeout(timeout);
      return;
    }

    setCheckoutAddress((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- HANDLE AREA SELECT ---------------- */
  const handleAreaSelect = (area) => {
    setCheckoutAddress((prev) => ({
      ...prev,
      locality: area.Name,
      postalCode: area.Pincode || '',
      // If state/city not set, fill from API response
      state: prev.state || area.State || '',
      city: prev.city || area.District || '',
    }));
    setAreas([]);
  };

  /* ---------------- SELECT SAVED ADDRESS ---------------- */
  const selectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    
    // Find state code for fetching cities
    const stateObj = states.find(s => s.name === addr.state);
    
    setCheckoutAddress({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      alternatePhone: addr.alternatePhone || '',
      email: addr.email || '',
      state: addr.state || '',
      stateCode: stateObj?.iso2 || addr.stateCode || '',
      city: addr.city || '',
      locality: addr.locality || '',
      addressLine1: addr.addressLine1 || '',
      postalCode: addr.postalCode || '',
      latitude: addr.latitude || null,
      longitude: addr.longitude || null,
    });
    
    // Fetch cities for the selected state
    if (stateObj?.iso2 || addr.stateCode) {
      fetchCities(stateObj?.iso2 || addr.stateCode);
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

  const isAddressValid = () => {
    return (
      checkoutAddress.fullName &&
      checkoutAddress.phone &&
      checkoutAddress.state &&
      checkoutAddress.city &&
      checkoutAddress.addressLine1 &&
      checkoutAddress.postalCode
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (areaSearchTimeout) {
        clearTimeout(areaSearchTimeout);
      }
    };
  }, [areaSearchTimeout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2"></div>
            <div className="p-12 text-center">
              <div className="w-40 h-40 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full relative z-10 text-blue-600 p-8">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
              <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
              <button 
                onClick={() => navigate('/')}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-slideUp overflow-hidden">
            {/* Success Header with Gradient */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-slow">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Order Placed! 🎉</h2>
                <p className="text-green-50">Your order has been confirmed successfully</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Order ID</span>
                  <span className="font-bold text-gray-900 font-mono text-lg">
                    #{(orderDetails?.orderId || orderDetails?.order?._id || 'N/A').toString().slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="font-bold text-green-600 text-2xl">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Payment</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💵</span>
                    <span className="font-semibold text-gray-900">Cash on Delivery</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Delivery</span>
                  <span className="font-semibold text-blue-600">3-5 Business Days</span>
                </div>
              </div>

              {/* Delivery Tracking Animation */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center animate-bounce-slow">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">Your order is being prepared</p>
                  <p className="text-sm text-blue-600">We'll notify you once it's shipped</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleSuccessModalClose}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Track Order
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/');
                  }}
                  className="bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Enhanced Progress Steps */}
        <div className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              {[
                { step: 1, label: 'Shopping Cart', icon: '🛒' },
                { step: 2, label: 'Delivery Address', icon: '📍' },
                { step: 3, label: 'Payment', icon: '💳' },
              ].map((item, index) => (
                <div key={item.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                      currentStep >= item.step 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-110' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {currentStep > item.step ? (
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{item.icon}</span>
                      )}
                      {currentStep === item.step && (
                        <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping"></div>
                      )}
                    </div>
                    <span className={`mt-2 font-semibold text-sm transition-all duration-300 ${
                      currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  
                  {index < 2 && (
                    <div className="relative mx-4 sm:mx-8">
                      <div className="w-16 sm:w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ${
                          currentStep > item.step ? 'w-full' : 'w-0'
                        }`}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Section - Steps */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* STEP 1: Cart Items */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
                <div 
                  className={`flex items-center justify-between p-5 cursor-pointer transition-all duration-300 ${
                    currentStep === 1 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'
                  }`}
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-md transition-all duration-300 ${
                      currentStep === 1 
                        ? 'bg-white text-blue-600' 
                        : currentStep > 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-400'
                    }`}>
                      {currentStep > 1 ? '✓' : '🛒'}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${currentStep === 1 ? 'text-white' : 'text-gray-900'}`}>
                        Shopping Cart
                      </h3>
                      <p className={`text-sm ${currentStep === 1 ? 'text-blue-100' : 'text-gray-500'}`}>
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                  {currentStep !== 1 && (
                    <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
                      Modify
                    </button>
                  )}
                </div>

                {currentStep === 1 && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item._id} className="group bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-md transition-all duration-300 border border-gray-100">
                          <div className="flex gap-5">
                            <div className="relative w-28 h-28 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-gray-100 group-hover:shadow-lg transition-all">
                              <img
                                src={item.product.images?.[0] || '/placeholder.png'}
                                alt={item.product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1 truncate text-lg">{item.product.name}</h3>
                              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {item.product.vendor?.name || 'Official Store'}
                              </p>

                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl font-bold text-gray-900">
                                  ₹{item.product.finalPrice || item.product.sellingPrice}
                                </span>
                                {item.product.mrp && item.product.mrp > (item.product.finalPrice || item.product.sellingPrice) && (
                                  <>
                                    <span className="text-base text-gray-400 line-through">₹{item.product.mrp}</span>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                                      {Math.round(((item.product.mrp - (item.product.finalPrice || item.product.sellingPrice)) / item.product.mrp) * 100)}% OFF
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                  <button
                                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                    className="px-4 py-2 hover:bg-gray-50 transition-colors font-bold text-gray-600 hover:text-blue-600"
                                  >
                                    −
                                  </button>
                                  <span className="px-5 py-2 font-bold text-gray-900 border-x-2 border-gray-200 min-w-[60px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                    className="px-4 py-2 hover:bg-gray-50 transition-colors font-bold text-gray-600 hover:text-blue-600"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeItem(item.product._id)}
                                  className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                              <p className="text-2xl font-bold text-gray-900">
                                ₹{(item.product.finalPrice || item.product.sellingPrice) * item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                      >
                        Continue to Address
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep > 1 && (
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-lg font-bold text-gray-900">₹{subtotal}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Address */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
                <div 
                  className={`flex items-center justify-between p-5 cursor-pointer transition-all duration-300 ${
                    currentStep === 2 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                      : currentStep > 2 
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-md transition-all duration-300 ${
                      currentStep === 2 
                        ? 'bg-white text-blue-600' 
                        : currentStep > 2
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}>
                      {currentStep > 2 ? '✓' : '📍'}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${currentStep === 2 ? 'text-white' : currentStep > 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                        Delivery Address
                      </h3>
                      <p className={`text-sm ${currentStep === 2 ? 'text-blue-100' : currentStep > 2 ? 'text-gray-500' : 'text-gray-400'}`}>
                        Where should we deliver?
                      </p>
                    </div>
                  </div>
                  {currentStep > 2 && (
                    <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
                      Change
                    </button>
                  )}
                </div>

                {currentStep === 2 && (
                  <div className="p-6">
                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && !showAddressForm && (
                      <div className="mb-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Saved Addresses
                        </h3>
                        <div className="space-y-4">
                          {savedAddresses.map((addr) => (
                            <label
                              key={addr._id}
                              className={`group block border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                                selectedAddressId === addr._id
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-1 ${
                                  selectedAddressId === addr._id
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300 group-hover:border-blue-400'
                                }`}>
                                  {selectedAddressId === addr._id && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <input
                                  type="radio"
                                  name="savedAddress"
                                  checked={selectedAddressId === addr._id}
                                  onChange={() => selectSavedAddress(addr)}
                                  className="hidden"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-900 text-lg">{addr.fullName}</span>
                                    {addr.isDefault && (
                                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">
                                        DEFAULT
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-600 mb-1">
                                    {addr.addressLine1}, {addr.locality}
                                  </p>
                                  <p className="text-gray-600 mb-2">
                                    {addr.city}, {addr.state} - <span className="font-semibold">{addr.postalCode}</span>
                                  </p>
                                  <p className="text-gray-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {addr.phone}
                                  </p>
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
                              state: '', stateCode: '', city: '', locality: '', addressLine1: '',
                              postalCode: '', latitude: null, longitude: null,
                            });
                          }}
                          className="mt-5 w-full border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-4 flex items-center justify-center gap-3 text-blue-600 font-semibold hover:bg-blue-50 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          Add New Address
                        </button>
                      </div>
                    )}

                    {/* Address Form */}
                    {(showAddressForm || savedAddresses.length === 0) && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {savedAddresses.length > 0 ? 'Add New Address' : 'Enter Delivery Address'}
                          </h3>
                          {savedAddresses.length > 0 && (
                            <button
                              onClick={() => {
                                setShowAddressForm(false);
                                if (savedAddresses.length > 0) selectSavedAddress(savedAddresses[0]);
                              }}
                              className="text-sm text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="relative">
                            <input
                              name="fullName"
                              value={checkoutAddress.fullName}
                              onChange={handleChange}
                              placeholder="Full Name *"
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                            />
                          </div>
                          <div className="relative">
                            <input
                              name="phone"
                              value={checkoutAddress.phone}
                              onChange={handleChange}
                              placeholder="Mobile Number *"
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                            />
                          </div>
                          <div className="relative">
                            <input
                              name="alternatePhone"
                              value={checkoutAddress.alternatePhone}
                              onChange={handleChange}
                              placeholder="Alternate Phone (Optional)"
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                            />
                          </div>
                          <div className="relative">
                            <input
                              name="email"
                              value={checkoutAddress.email}
                              onChange={handleChange}
                              placeholder="Email Address (Optional)"
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                            />
                          </div>
                          
                          {/* State Dropdown */}
                          <div className="relative">
                            <select
                              name="state"
                              value={checkoutAddress.state}
                              onChange={handleChange}
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium appearance-none cursor-pointer"
                            >
                              <option value="">Select State *</option>
                              {states.map((s) => (
                                <option key={s.iso2} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                            <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          
                          {/* City Dropdown */}
                          <div className="relative">
                            <select
                              name="city"
                              value={checkoutAddress.city}
                              onChange={handleChange}
                              disabled={!checkoutAddress.state || loadingCities}
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {loadingCities ? 'Loading cities...' : 'Select City *'}
                              </option>
                              {cities.map((c) => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                            {loadingCities ? (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Area/Locality with Autocomplete */}
                          <div className="md:col-span-2 relative">
                            <div className="relative">
                              <input
                                name="locality"
                                value={checkoutAddress.locality}
                                onChange={handleChange}
                                placeholder="Search Area, Colony, Post Office *"
                                disabled={!checkoutAddress.city}
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                              {loadingAreas && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                            
                            {/* Area Suggestions Dropdown */}
                            {areas.length > 0 && (
                              <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border-2 border-blue-500 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                {areas.map((area, i) => (
                                  <div
                                    key={i}
                                    onClick={() => handleAreaSelect(area)}
                                    className="px-5 py-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <div>
                                        <p className="font-semibold text-gray-900">{area.Name}</p>
                                        <p className="text-sm text-gray-500">
                                          {area.Block && `${area.Block}, `}{area.District}, {area.State} - <span className="font-semibold text-blue-600">{area.Pincode}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Type at least 3 characters to search for areas. Pincode will be auto-filled.
                            </p>
                          </div>
                          
                          {/* Address Line */}
                          <div className="md:col-span-2">
                            <textarea
                              name="addressLine1"
                              value={checkoutAddress.addressLine1}
                              onChange={handleChange}
                              placeholder="House No, Building Name, Street *"
                              rows={3}
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium resize-none"
                            />
                          </div>
                          
                          {/* Pincode - Editable with auto-fill */}
                          <div className="relative">
                            <input
                              name="postalCode"
                              value={checkoutAddress.postalCode}
                              onChange={handleChange}
                              placeholder="Pincode *"
                              maxLength={6}
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                            />
                            {checkoutAddress.postalCode && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                              Auto-filled from area selection, but you can edit if needed
                            </p>
                          </div>
                          
                          {/* Save Address Checkbox */}
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                className="w-6 h-6 text-blue-600 rounded-md border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">Save this address for future orders</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={!isAddressValid()}
                        className={`group px-12 py-4 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${
                          isAddressValid()
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transform hover:-translate-y-0.5'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Deliver Here
                        <svg className={`w-5 h-5 ${isAddressValid() ? 'group-hover:translate-x-1' : ''} transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep > 2 && (
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="font-bold text-gray-900">{checkoutAddress.fullName}</p>
                        <p className="text-gray-600 text-sm">{checkoutAddress.addressLine1}, {checkoutAddress.locality}, {checkoutAddress.city}, {checkoutAddress.state} - {checkoutAddress.postalCode}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Payment */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
                <div 
                  className={`flex items-center gap-4 p-5 ${
                    currentStep === 3 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                    currentStep === 3 ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-500'
                  }`}>
                    💳
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${currentStep === 3 ? 'text-white' : 'text-gray-400'}`}>
                      Payment Method
                    </h3>
                    <p className={`text-sm ${currentStep === 3 ? 'text-blue-100' : 'text-gray-400'}`}>
                      Choose how you'd like to pay
                    </p>
                  </div>
                </div>

                {currentStep === 3 && (
                  <div className="p-6">
                    <div className="space-y-4 mb-8">
                      <label className={`group relative flex items-center gap-5 p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
                        paymentMethod === 'cod' 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}>
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 group-hover:border-blue-400'
                        }`}>
                          {paymentMethod === 'cod' && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="hidden"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg mb-1">Cash on Delivery</p>
                          <p className="text-gray-600">Pay when you receive your order</p>
                        </div>
                        <div className="text-5xl">💵</div>
                        {paymentMethod === 'cod' && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              SELECTED
                            </span>
                          </div>
                        )}
                      </label>

                      <label className="relative flex items-center gap-5 p-6 border-2 border-gray-200 rounded-xl opacity-60 cursor-not-allowed overflow-hidden">
                        <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                        <input type="radio" disabled className="hidden" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg mb-1">Online Payment</p>
                          <p className="text-gray-600">UPI, Cards, Net Banking & More</p>
                        </div>
                        <div className="text-5xl grayscale">💳</div>
                        <div className="absolute top-2 right-2">
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                            COMING SOON
                          </span>
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={checkout}
                      disabled={checkoutLoading}
                      className="group w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-5 rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                          Processing Your Order...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Confirm Order • ₹{totalAmount}
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Safe and secure checkout
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg sticky top-24 overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5">
                  <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    Price Details
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Price ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Delivery Charges</span>
                    <span className={`font-bold ${deliveryCharges === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {deliveryCharges === 0 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          FREE
                        </span>
                      ) : (
                        `₹${deliveryCharges}`
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t-2 border-dashed border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-bold text-lg">Total Amount</span>
                      <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
                
                {deliveryCharges === 0 ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200 p-4">
                    <p className="text-green-700 font-semibold flex items-center gap-2">
                      <span className="text-2xl">🎉</span>
                      You saved ₹40 on delivery!
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-t-2 border-orange-200 p-4">
                    <p className="text-orange-700 font-semibold flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      Add ₹{499 - subtotal} more for FREE delivery!
                    </p>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Why Shop With Us?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">100% Genuine Products</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <span className="font-medium">Easy Returns & Exchange</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </>
  );
};

export default Cart;