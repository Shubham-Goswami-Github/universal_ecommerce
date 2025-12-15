// src/pages/Cart.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const loadCart = async () => {
    try {
      const res = await axiosClient.get('/api/cart');
      setCart(res.data.cart || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQty = async (productId, quantity) => {
    setMessage('');
    try {
      await axiosClient.put('/api/cart/update', { productId, quantity });
      await loadCart();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to update cart.');
    }
  };

  const removeItem = async (productId) => {
    setMessage('');
    try {
      await axiosClient.delete(`/api/cart/remove/${productId}`);
      await loadCart();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to remove item.');
    }
  };

  const clearCart = async () => {
    setMessage('');
    try {
      await axiosClient.delete('/api/cart/clear');
      await loadCart();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to clear cart.');
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setCheckoutAddress((prev) => ({ ...prev, [name]: value }));
  };

  const checkout = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axiosClient.post('/api/orders/checkout', {
        ...checkoutAddress,
        paymentMethod: 'cod',
      });
      setCheckoutAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
      });
      await loadCart();
      setMessage('Order placed successfully ✅');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Checkout failed.');
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, it) => sum + (it.product?.price || 0) * it.quantity,
    0
  );

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 mb-3">
          My Cart
        </h1>

        {message && (
          <div className="mb-3 text-xs text-teal-300">{message}</div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-slate-400">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    {item.product?.name || 'Product'}
                  </div>
                  <div className="text-xs text-slate-400">
                    ₹{item.product?.price || 0} × {item.quantity}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <label className="text-slate-300">Qty:</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQty(
                          item.product?._id,
                          Number(e.target.value) || 1
                        )
                      }
                      className="w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                    <button
                      onClick={() => removeItem(item.product?._id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-sm text-teal-300 font-semibold">
                  ₹
                  {(item.product?.price || 0) * item.quantity}
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="mt-2 text-xs text-red-400 hover:text-red-300"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>

      {/* Checkout */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 h-fit sticky top-20">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          Checkout
        </h2>
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-slate-300">Subtotal</span>
          <span className="text-teal-300 font-semibold">₹{subtotal}</span>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-500">
            Add items to cart to proceed.
          </p>
        ) : (
          <form onSubmit={checkout} className="space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={checkoutAddress.fullName}
                  onChange={handleAddressChange}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  value={checkoutAddress.phone}
                  onChange={handleAddressChange}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Address Line 1
              </label>
              <input
                name="addressLine1"
                value={checkoutAddress.addressLine1}
                onChange={handleAddressChange}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">
                  City
                </label>
                <input
                  name="city"
                  value={checkoutAddress.city}
                  onChange={handleAddressChange}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">
                  State
                </label>
                <input
                  name="state"
                  value={checkoutAddress.state}
                  onChange={handleAddressChange}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">
                  Pincode
                </label>
                <input
                  name="postalCode"
                  value={checkoutAddress.postalCode}
                  onChange={handleAddressChange}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 rounded-md bg-teal-400 text-slate-900 text-sm font-semibold py-2 hover:bg-teal-300"
            >
              Place Order (COD)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Cart;
