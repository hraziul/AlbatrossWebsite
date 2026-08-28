export default function Checkout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-24">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase mb-12">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Shipping Information</h2>
            <div className="space-y-4">
              <input type="text" className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400" placeholder="Full Name" />
              <input type="text" className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400" placeholder="Address Line 1" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400" placeholder="City" />
                <input type="text" className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400" placeholder="PIN Code" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Payment Method</h2>
            <div className="p-6 border border-white/10 bg-white/5 cursor-pointer hover:border-cyan-400 transition-colors mb-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">Credit Card / Debit Card / UPI</span>
              </div>
            </div>
          </div>
          <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Complete Order
          </button>
        </div>
        <div>
          <div className="bg-neutral-900 border border-white/10 p-8 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="font-mono text-cyan-400">₹0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Shipping</span>
                <span className="font-mono text-cyan-400">Free</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-6">
              <span className="uppercase tracking-widest">Total</span>
              <span className="font-mono text-fuchsia-500">₹0.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
