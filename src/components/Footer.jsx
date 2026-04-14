export default function Footer() {
  return (
    <footer className="bg-charcoal text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold">NovaCraft Agency</h3>
          <p className="text-sm opacity-80 mt-2">Premium web development, branding, and growth services.</p>
        </div>
        <div>
          <h4 className="font-semibold">Contact</h4>
          <p className="text-sm opacity-80">hello@novacraft.agency</p>
          <p className="text-sm opacity-80">+1 (555) 013-2045</p>
        </div>
        <div>
          <h4 className="font-semibold">Social</h4>
          <p className="text-sm opacity-80">LinkedIn / Instagram / X</p>
        </div>
      </div>
    </footer>
  );
}
