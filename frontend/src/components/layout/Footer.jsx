const Footer = () => (
  <footer className="mt-auto border-t border-slate-200 bg-white py-4">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-sm text-slate-500">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-slate-700">
          Multi-vendor Ecommerce
        </span>
        . All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
