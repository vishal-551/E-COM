import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();

  return (
    <footer className="bg-charcoal text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold">{settings.storeName || 'E-COM'}</h3>
          <p className="text-sm opacity-80 mt-2">{settings.footerText || 'Production-ready e-commerce storefront.'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Support</h4>
          <p className="text-sm opacity-80">{settings.supportEmail || 'support@example.com'}</p>
          <p className="text-sm opacity-80">{settings.supportPhone || '+1 000 000 0000'}</p>
        </div>
        <div>
          <h4 className="font-semibold">Policies</h4>
          <p className="text-sm opacity-80">Returns · Privacy · Terms</p>
        </div>
      </div>
    </footer>
  );
}
