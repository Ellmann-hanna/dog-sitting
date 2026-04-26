import React, { useState, useEffect } from 'react';
import {
  Phone, Mail, MapPin, Star, Heart, Clock, Home,
  CheckCircle, Moon, Menu, X, ChevronDown, PawPrint, Shield, Leaf,
} from 'lucide-react';

// ─── Image URLs (Unsplash) ────────────────────────────────────────────────────
const IMG = {
  hero:      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&auto=format&fit=crop&q=85',
  about:     'https://images.unsplash.com/photo-1576201836106-db1758f5b6f3?w=900&auto=format&fit=crop&q=80',
  dog1:      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=700&auto=format&fit=crop&q=80',
  dog2:      'https://images.unsplash.com/photo-1534361960057-19f4434a956d?w=700&auto=format&fit=crop&q=80',
  dog3:      'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=700&auto=format&fit=crop&q=80',
  dog4:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&auto=format&fit=crop&q=80',
  dog5:      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=700&auto=format&fit=crop&q=80',
  dog6:      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=700&auto=format&fit=crop&q=80',
  community: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1200&auto=format&fit=crop&q=80',
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const NAV_LINKS = ['About', 'Services', 'Pricing', 'Gallery', 'Community', 'Contact'];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const base = scrolled ? 'text-stone-700' : 'text-white';
  const navBg = scrolled ? 'bg-white shadow-md' : 'bg-transparent';

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <PawPrint size={28} className="text-amber-500" />
          <div className="leading-tight">
            <div className={`font-display text-xl font-bold ${base}`}>Danville Doggy</div>
            <div className={`text-xs font-medium ${scrolled ? 'text-amber-500' : 'text-amber-300'}`}>Boarding & Care</div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className={`text-sm font-medium hover:text-amber-500 transition-colors ${base}`}
            >
              {l}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-lg shadow-amber-500/25"
          >
            Book a Stay
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(p => !p)} className={`md:hidden ${base}`} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 shadow-xl">
          <div className="px-4 py-5 space-y-2">
            {NAV_LINKS.map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="block py-2 text-stone-700 font-medium hover:text-amber-500 transition-colors"
              >
                {l}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="block mt-3 bg-amber-500 text-white text-center py-3 rounded-full font-semibold"
            >
              Book a Stay
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero: React.FC = () => (
  <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
    {/* Background image */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
      style={{ backgroundImage: `url(${IMG.hero})` }}
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/70" />

    <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
      {/* Stars */}
      <div className="flex justify-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
        ))}
      </div>

      <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-5 leading-tight drop-shadow-lg">
        A Home Away<br />From Home
      </h1>
      <p className="text-xl md:text-2xl text-white/85 font-light mb-3">
        Premium dog boarding in the heart of{' '}
        <span className="text-amber-400 font-semibold">Danville, California</span>
      </p>
      <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto">
        Intimate care for up to 3 dogs — three daily walks, cozy overnight stays,
        and all the love your pup deserves.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#contact"
          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-2xl hover:-translate-y-0.5 shadow-lg"
        >
          Book a Stay
        </a>
        <a
          href="#about"
          className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all"
        >
          Learn More
        </a>
      </div>
    </div>

    {/* Scroll indicator */}
    <a
      href="#about"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white animate-bounce transition-colors"
    >
      <ChevronDown size={32} />
    </a>
  </section>
);

// ─── About ────────────────────────────────────────────────────────────────────
const About: React.FC = () => (
  <section id="about" className="py-24 md:py-32 bg-amber-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Image column */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={IMG.about}
              alt="Cozy single-family home in Danville, CA"
              className="w-full h-96 lg:h-[520px] object-cover"
            />
          </div>
          {/* Floating badge */}
          <div className="absolute -bottom-6 -right-4 bg-white rounded-2xl p-5 shadow-xl max-w-[200px]">
            <div className="flex items-center gap-2 mb-1.5">
              <PawPrint size={18} className="text-amber-500" />
              <span className="font-bold text-stone-800 text-sm">Max 3 Dogs</span>
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              Small group means personal attention for every pup
            </p>
          </div>
        </div>

        {/* Text column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-amber-400" />
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">Our Story</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-6 leading-tight">
            Where Every Dog<br />Feels at Home
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-5">
            Nestled in a beautiful single-family home in Danville, California, we offer a warm,
            loving environment for your beloved pets. Our home is more than just a boarding
            facility — it's a second home where your dog is treated as family.
          </p>
          <p className="text-stone-600 text-lg leading-relaxed mb-10">
            We deliberately limit stays to a maximum of <strong className="text-stone-800">3 dogs at a time</strong>,
            so every pup receives the individual attention, love, and care they deserve.
            No kennels, no cages — just cozy beds, a spacious fenced yard, and plenty of cuddles.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '3',  label: 'Max Dogs',    Icon: PawPrint },
              { num: '3×', label: 'Daily Walks', Icon: Heart },
              { num: '5★', label: 'Top Rated',   Icon: Star },
            ].map(({ num, label, Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <Icon size={20} className="mx-auto mb-2 text-amber-500" />
                <div className="font-display text-2xl font-bold text-stone-800">{num}</div>
                <div className="text-xs text-stone-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    Icon: PawPrint,
    title: 'Small Group Boarding',
    desc: 'Maximum 3 dogs at a time so your pup always gets personal attention in a calm, stress-free home.',
    accent: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
  },
  {
    Icon: Heart,
    title: '3 Daily Walks',
    desc: 'Every dog enjoys three daily walks through Danville\'s beautiful trails and parks — morning, midday, and evening.',
    accent: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
  },
  {
    Icon: Moon,
    title: 'Overnight Boarding',
    desc: 'Comfortable overnight stays inside our warm home. Dogs sleep safely with room to stretch, relax, and dream.',
    accent: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
  },
  {
    Icon: Home,
    title: 'True Home Environment',
    desc: 'A real single-family home, not a kennel. Your dog gets living spaces, a backyard, and all the comforts of home.',
    accent: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
  },
  {
    Icon: Shield,
    title: 'Safe & Fully Fenced',
    desc: 'Secure, fully fenced yard with no escape routes. Your pet\'s safety is always our top priority.',
    accent: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
  },
  {
    Icon: Clock,
    title: 'Daily Photo Updates',
    desc: 'We send photos and texts every day so you can see exactly how much fun your pup is having while you\'re away.',
    accent: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
  },
];

const Services: React.FC = () => (
  <section id="services" className="py-24 md:py-32 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-8 bg-amber-400" />
          <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">What We Offer</span>
          <div className="h-px w-8 bg-amber-400" />
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-4">
          Everything Your Pup Needs
        </h2>
        <p className="text-stone-500 text-lg max-w-2xl mx-auto">
          We go above and beyond to make sure every dog in our care is happy, healthy, and loved.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SERVICES.map(({ Icon, title, desc, accent }) => (
          <div
            key={title}
            className="group p-8 rounded-3xl border border-stone-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 cursor-default"
          >
            <div className={`inline-flex p-3 rounded-2xl mb-5 transition-colors ${accent}`}>
              <Icon size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-stone-800 mb-3">{title}</h3>
            <p className="text-stone-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Pricing ──────────────────────────────────────────────────────────────────
const INCLUDES = [
  '3 daily walks (morning, midday & evening)',
  'All meals included — or bring your own food',
  'Cozy sleeping area inside the home',
  'Daily photo & text updates',
  'Secure fenced backyard playtime',
  'Individual attention and lots of cuddles',
];

const Pricing: React.FC = () => (
  <section id="pricing" className="py-24 md:py-32 bg-stone-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-8 bg-amber-500" />
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest">Transparent Pricing</span>
          <div className="h-px w-8 bg-amber-500" />
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Fair Pricing
        </h2>
        <p className="text-stone-400 text-lg max-w-2xl mx-auto">
          No hidden fees. Everything your dog needs — included.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Main pricing card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 text-white shadow-2xl shadow-amber-900/40">
          <div className="flex items-center gap-3 mb-6">
            <Moon size={22} />
            <h3 className="font-display text-2xl font-bold">Standard Overnight Stay</h3>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-7xl font-black tracking-tight">$70</span>
            <span className="text-amber-200 text-xl">/ night</span>
          </div>
          <p className="text-amber-200 text-sm mb-8">Per dog · Max 3 dogs total · 7 days a week</p>

          <div className="space-y-3.5 mb-8">
            {INCLUDES.map(item => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle size={17} className="text-amber-200 mt-0.5 shrink-0" />
                <span className="text-amber-50 text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>

          <a
            href="#contact"
            className="block bg-white text-amber-600 text-center py-4 rounded-2xl font-bold text-lg hover:bg-amber-50 transition-colors shadow-lg"
          >
            Book Your Dog's Stay
          </a>
        </div>

        {/* Multi-dog note */}
        <div className="bg-stone-800 rounded-2xl p-5 text-center border border-stone-700">
          <p className="text-stone-300 text-sm">
            <span className="text-amber-400 font-semibold">Multi-dog discount:</span>{' '}
            $10 off per night for a second dog from the same family.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ─── Gallery ──────────────────────────────────────────────────────────────────
const DOGS = [
  { src: IMG.dog1, alt: 'Two happy dogs playing together',  tall: true  },
  { src: IMG.dog2, alt: 'Adorable puppy close-up',          tall: false },
  { src: IMG.dog3, alt: 'Smiling golden dog outdoors',      tall: false },
  { src: IMG.dog4, alt: 'Sweet dog portrait',               tall: false },
  { src: IMG.dog5, alt: 'Dog on a sunny morning walk',      tall: false },
  { src: IMG.dog6, alt: 'Playful pup in the grass',         tall: false },
];

const Gallery: React.FC = () => (
  <section id="gallery" className="py-24 md:py-32 bg-amber-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-8 bg-amber-400" />
          <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">Happy Pups</span>
          <div className="h-px w-8 bg-amber-400" />
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-4">
          Our Furry Guests
        </h2>
        <p className="text-stone-500 text-lg max-w-2xl mx-auto">
          Every dog leaves here happy, loved, and ready to come back!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DOGS.map(({ src, alt, tall }, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-3xl group ${tall ? 'row-span-2' : ''}`}
          >
            <img
              src={src}
              alt={alt}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                tall ? 'h-full min-h-[500px]' : 'h-52 md:h-64'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Community ────────────────────────────────────────────────────────────────
const COMMUNITY_HIGHLIGHTS = [
  { Icon: Leaf,    title: 'Iron Horse Trail',       desc: 'Scenic paved trail along the creek' },
  { Icon: MapPin,  title: 'Sycamore Valley Park',   desc: 'Beautiful park for off-leash play' },
  { Icon: Heart,   title: 'Friendly Neighborhood',  desc: 'Safe, quiet, tree-lined streets' },
  { Icon: Star,    title: 'Pet-Friendly Town',       desc: 'Danville loves its four-legged residents' },
];

const Community: React.FC = () => (
  <section id="community" className="py-24 md:py-32 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Text */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-amber-400" />
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">The Danville Difference</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-6 leading-tight">
            Beautiful Danville,<br />California
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-5">
            Danville is one of the San Francisco Bay Area's most charming communities — a small
            town nestled at the foot of Mount Diablo, with scenic trails, lush parks,
            and a warm, welcoming neighborhood feel that dogs absolutely love.
          </p>
          <p className="text-stone-600 text-lg leading-relaxed mb-10">
            Your dog will enjoy exploring the beautiful green spaces nearby, from the
            tree-lined Iron Horse Trail to the open fields of Sycamore Valley Park.
            Our neighborhood is safe, quiet, and perfect for leisurely walks.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {COMMUNITY_HIGHLIGHTS.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl">
                <div className="p-2 bg-amber-100 rounded-xl shrink-0">
                  <Icon size={16} className="text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-stone-800 text-sm">{title}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={IMG.community}
              alt="Beautiful Danville California neighborhood"
              className="w-full h-[500px] object-cover"
            />
          </div>
          {/* Location badge */}
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2.5">
              <MapPin size={18} className="text-amber-500 shrink-0" />
              <div>
                <div className="font-bold text-stone-800 text-sm">Danville, CA 94526</div>
                <div className="text-xs text-stone-500">San Ramon Valley</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Contact ──────────────────────────────────────────────────────────────────
type FormState = {
  name: string; email: string; phone: string;
  dogName: string; breed: string; dates: string; message: string;
};

const CONTACT_INFO = [
  { Icon: Phone,  label: 'Phone',               value: '(925) 555-0142',        href: 'tel:+19255550142' },
  { Icon: Mail,   label: 'Email',               value: 'hello@danvilledoggy.com', href: 'mailto:hello@danvilledoggy.com' },
  { Icon: MapPin, label: 'Location',            value: 'Danville, CA 94526',    href: null },
  { Icon: Clock,  label: 'Check-in / Check-out', value: '8 AM – 6 PM, 7 days a week', href: null },
];

const FORM_FIELDS: { label: string; key: keyof FormState; placeholder: string; type: string }[] = [
  { label: 'Your Name',    key: 'name',    placeholder: 'Jane Smith',       type: 'text'  },
  { label: 'Email',        key: 'email',   placeholder: 'jane@email.com',   type: 'email' },
  { label: 'Phone',        key: 'phone',   placeholder: '(925) 555-0000',   type: 'tel'   },
  { label: "Dog's Name",   key: 'dogName', placeholder: 'Buddy',            type: 'text'  },
  { label: 'Breed',        key: 'breed',   placeholder: 'Golden Retriever', type: 'text'  },
  { label: 'Dates Needed', key: 'dates',   placeholder: 'May 15 – May 18',  type: 'text'  },
];

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', dogName: '', breed: '', dates: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <section id="contact" className="py-24 md:py-32 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-8 bg-amber-400" />
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">Get In Touch</span>
            <div className="h-px w-8 bg-amber-400" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            Book Your Dog's Stay
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Ready to book or have a question? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left: contact info + testimonial */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-stone-800 mb-6">
                Contact Information
              </h3>
              <div className="space-y-5">
                {CONTACT_INFO.map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl shrink-0">
                      <Icon size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-1">
                        {label}
                      </div>
                      {href ? (
                        <a href={href} className="text-stone-700 font-semibold hover:text-amber-600 transition-colors">
                          {value}
                        </a>
                      ) : (
                        <span className="text-stone-700 font-semibold">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-stone-600 italic text-sm leading-relaxed mb-4">
                "Our golden retriever absolutely loves staying here. She comes home so happy
                and well-exercised. Best boarding we've ever used — we can't recommend it enough!"
              </p>
              <div className="text-sm font-semibold text-stone-800">— Sarah M., Danville</div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-3xl p-10 shadow-sm h-full flex flex-col items-center justify-center text-center min-h-[420px]">
                <div className="p-4 bg-amber-100 rounded-full mb-6">
                  <CheckCircle size={40} className="text-amber-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-stone-800 mb-3">Message Received!</h3>
                <p className="text-stone-500 text-lg max-w-sm">
                  Thank you! We'll get back to you within 24 hours to confirm availability
                  and chat about your dog's stay.
                </p>
              </div>
            ) : (
              <form
                onSubmit={e => { e.preventDefault(); setSubmitted(true); }}
                className="bg-white rounded-3xl p-8 shadow-sm space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {FORM_FIELDS.map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                        {label}
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={set(key)}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your dog's personality, dietary needs, medications, or anything else we should know…"
                    value={form.message}
                    onChange={set('message')}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-lg"
                >
                  Send Message & Check Availability
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer: React.FC = () => (
  <footer className="bg-stone-900 text-stone-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <PawPrint size={24} className="text-amber-500" />
          <div>
            <div className="font-display font-bold text-white">Danville Doggy Boarding</div>
            <div className="text-xs text-stone-500">Danville, California 94526</div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {NAV_LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-amber-400 transition-colors">
              {l}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-xs text-stone-500 text-center">
          © {new Date().getFullYear()} Danville Doggy Boarding
          <br />
          Made with{' '}
          <Heart size={11} className="inline text-rose-400 fill-rose-400" />{' '}
          in Danville, CA
        </div>
      </div>
    </div>
  </footer>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <div className="font-sans">
    <Navbar />
    <Hero />
    <About />
    <Services />
    <Pricing />
    <Gallery />
    <Community />
    <Contact />
    <Footer />
  </div>
);

export default App;
