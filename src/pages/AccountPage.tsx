import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import type { Page } from '../types';

interface AccountPageProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

type AccountTab = 'customer' | 'manufacturer' | 'login';

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const { login, register, isLoggedIn, user, logout, backendOnline } = useAuth();

  const [tab, setTab] = useState<AccountTab>('customer');
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Manufacturer extra fields
  const [brandName, setBrandName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [gst, setGst] = useState('');

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Already logged in
  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-purple/10 border-2 border-purple/30 flex items-center justify-center mx-auto mb-5 text-2xl">
            👑
          </div>
          <h2 className="text-2xl text-charcoal mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Welcome back, {user.name ?? user.email}
          </h2>
          {user.role === 'ADMIN' && (
            <p className="text-xs text-gold bg-gold/10 border border-gold/25 inline-block px-3 py-1 rounded-full mb-4 uppercase tracking-wider font-medium">
              Admin Account
            </p>
          )}
          <p className="text-warm-gray text-sm mb-8">{user.email}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => onNavigate('dashboard')} className="bg-purple text-ivory px-8 py-3 rounded-lg hover:bg-purple-mid transition-colors font-medium">
              My Dashboard
            </button>
            {user.role === 'ADMIN' && (
              <button onClick={() => onNavigate('admin')} className="bg-charcoal text-ivory px-8 py-3 rounded-lg hover:bg-charcoal/80 transition-colors font-medium">
                Admin Panel
              </button>
            )}
            <button onClick={logout} className="border border-burgundy/30 text-burgundy px-8 py-3 rounded-lg hover:bg-burgundy/10 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setApiError(null);
    setLoading(true);

    if (tab === 'login') {
      const err = await login(email, password);
      setLoading(false);
      if (err) { setApiError(err); return; }
      onNavigate('dashboard');
      return;
    }

    if (tab === 'customer' || tab === 'manufacturer') {
      if (step === 'form') {
        if (!backendOnline) {
          // Offline: skip backend, just go to success
          setStep('otp');
          setLoading(false);
          return;
        }
        const nameValue = tab === 'manufacturer' ? ownerName : name;
        const err = await register(email, password, nameValue || undefined);
        setLoading(false);
        if (err) { setApiError(err); return; }
        // skip OTP since backend doesn't have OTP; show success
        setStep('success');
        return;
      }

      if (step === 'otp') {
        // Offline/simulated path — accept any 6-digit code or simulate
        setLoading(false);
        if (otp.length >= 4) setStep('success');
        else setApiError('Please enter the 6-digit OTP.');
        return;
      }
    }

    setLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl text-charcoal mb-3" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            {tab === 'manufacturer' ? 'Application Submitted!' : 'Account Created!'}
          </h2>
          <p className="text-warm-gray text-sm mb-8 leading-relaxed">
            {tab === 'manufacturer'
              ? 'Your manufacturer application is under review. You\'ll receive an email once approved.'
              : backendOnline
                ? 'Your account is live on the backend. You are now logged in.'
                : 'Demo account created. Start exploring authentic Paithani sarees.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => onNavigate('dashboard')} className="bg-purple text-ivory px-8 py-3 rounded-lg hover:bg-purple-mid transition-colors font-medium">
              Go to Dashboard
            </button>
            <button onClick={() => onNavigate('home')} className="border border-gold/30 text-charcoal px-8 py-3 rounded-lg hover:bg-gold/10 transition-colors">
              Explore Sarees
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left visual panel */}
        <div className="hidden lg:flex relative flex-col justify-end p-12 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1664636124899-4a121f1ce449?w=900&h=1200&fit=crop&auto=format"
            alt="Paithani saree"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-gold" />
              <p className="text-gold text-xs uppercase tracking-widest">Paithani Royale</p>
            </div>
            <h2 className="text-4xl text-ivory leading-tight mb-4" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              "The Legacy of Paithani, Directly From the Maker."
            </h2>
            <div className="flex gap-6 mt-8 text-xs text-ivory/50">
              <div><span className="text-gold font-semibold text-lg">500+</span><br />Authentic Sarees</div>
              <div><span className="text-gold font-semibold text-lg">40+</span><br />Verified Makers</div>
              <div><span className="text-gold font-semibold text-lg">12K+</span><br />Happy Customers</div>
            </div>

            {/* Backend status on left panel */}
            <div className={`mt-8 flex items-center gap-2 text-xs ${backendOnline ? 'text-emerald/80' : 'text-ivory/30'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald animate-pulse' : 'bg-ivory/20'}`} />
              {backendOnline ? 'Live backend connected — registration is real.' : 'Backend offline — demo mode.'}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            {step === 'form' && (
              <>
                <div className="mb-8">
                  <p className="text-xs text-gold uppercase tracking-widest mb-2">Join Paithani Royale</p>
                  <h1 className="text-3xl text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>
                    {tab === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  {!backendOnline && (
                    <p className="text-xs text-warm-gray mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-burgundy flex-shrink-0" />
                      Backend offline — running in demo mode
                    </p>
                  )}
                </div>

                {/* Tab switcher */}
                <div className="flex bg-ivory-dark rounded-xl p-1 mb-8">
                  {(
                    [['customer', "I'm a Customer"], ['manufacturer', "I'm a Manufacturer"], ['login', 'Login']] as [AccountTab, string][]
                  ).map(([t, label]) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setApiError(null); }}
                      className={`flex-1 py-2.5 text-xs rounded-lg transition-all duration-200 ${
                        tab === t ? 'bg-purple text-ivory shadow-sm' : 'text-warm-gray hover:text-charcoal'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {tab === 'login' && (
                    <>
                      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                      <div className="text-right">
                        <a href="#" className="text-xs text-purple hover:underline">Forgot password?</a>
                      </div>
                    </>
                  )}

                  {tab === 'customer' && (
                    <>
                      <Field label="Full Name" value={name} onChange={setName} placeholder="Priya Mehta" />
                      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="priya@example.com" />
                      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" />
                      <Field label="Confirm Password" type="password" value="" onChange={() => {}} placeholder="Repeat password" />
                      <Field label="City" value="" onChange={() => {}} placeholder="Mumbai" />
                      <Field label="State" value="" onChange={() => {}} placeholder="Maharashtra" />
                      <div>
                        <p className="text-xs text-warm-gray uppercase tracking-widest mb-2">Preferred Motifs (optional)</p>
                        <div className="flex flex-wrap gap-2">
                          {['Peacock', 'Munia', 'Asawali', 'Bangadi-Mor'].map((m) => (
                            <button key={m} type="button" className="text-xs border border-gold/25 px-3 py-1.5 rounded-full text-warm-gray hover:border-gold hover:text-charcoal transition-colors">
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {tab === 'manufacturer' && (
                    <>
                      <Field label="Brand Name" value={brandName} onChange={setBrandName} placeholder="Heritage Weaves" />
                      <Field label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="Ramchandra Deshmukh" />
                      <Field label="Business Email" type="email" value={email} onChange={setEmail} placeholder="info@heritageweaves.com" />
                      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" />
                      <Field label="Manufacturing Location" value="" onChange={() => {}} placeholder="Nashik, Maharashtra" />
                      <Field label="Years of Experience" type="number" value="" onChange={() => {}} placeholder="25" />
                      <Field label="GST Number" value={gst} onChange={setGst} placeholder="27XXXXX1234X1ZX" />
                      <div className="border-2 border-dashed border-gold/25 rounded-xl p-5 text-center hover:border-gold/50 transition-colors cursor-pointer">
                        <p className="text-xs text-warm-gray">Upload Business Documents</p>
                        <p className="text-gold text-xs mt-1">Click to browse</p>
                      </div>
                    </>
                  )}

                  {/* Error */}
                  {apiError && (
                    <div className="bg-burgundy/10 border border-burgundy/25 rounded-lg px-4 py-3 text-sm text-burgundy">
                      {apiError}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !email || !password}
                    className="w-full bg-purple text-ivory py-4 rounded-xl font-semibold hover:bg-purple-mid transition-all duration-300 shadow-lg hover:shadow-purple/25 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {tab === 'login' ? 'Login' : tab === 'manufacturer' ? 'Submit for Verification' : 'Create Account'}
                  </button>

                  {tab !== 'login' && (
                    <>
                      <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-gold/20" />
                        <span className="text-xs text-warm-gray">or</span>
                        <div className="flex-1 h-px bg-gold/20" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="border border-gold/25 py-3 px-4 rounded-xl text-xs text-charcoal hover:bg-ivory-dark transition-colors flex items-center justify-center gap-2">
                          <span className="font-bold text-peacock">G</span> Google
                        </button>
                        <button className="border border-gold/25 py-3 px-4 rounded-xl text-xs text-charcoal hover:bg-ivory-dark transition-colors flex items-center justify-center gap-2">
                          <span>📱</span> Mobile OTP
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* OTP step (offline / simulated) */}
            {step === 'otp' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple/10 border-2 border-purple/30 flex items-center justify-center mx-auto mb-5 text-2xl">
                  📱
                </div>
                <h3 className="text-xl text-charcoal mb-2" style={{ fontFamily: 'var(--font-display)' }}>Verify Your Number</h3>
                <p className="text-warm-gray text-sm mb-8">
                  {backendOnline ? 'OTP sent to your registered mobile.' : 'Demo mode — enter any 6 digits.'}
                </p>
                <div className="flex gap-3 justify-center mb-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      maxLength={1}
                      value={otp[i] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        setOtp((p) => p.slice(0, i) + v + p.slice(i + 1));
                        if (v) (e.target.nextElementSibling as HTMLElement)?.focus();
                      }}
                      className="w-11 h-14 text-center border-2 border-gold/25 rounded-xl text-lg font-bold text-charcoal focus:border-purple outline-none transition-colors"
                    />
                  ))}
                </div>
                {apiError && <p className="text-sm text-burgundy mb-4">{apiError}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-purple text-ivory py-4 rounded-xl font-semibold hover:bg-purple-mid transition-colors disabled:opacity-50"
                >
                  Verify OTP
                </button>
                <p className="text-xs text-warm-gray mt-4">
                  Didn't receive? <button className="text-purple hover:underline">Resend</button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small helper component ───────────────────────────────────────────────────

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-warm-gray uppercase tracking-widest block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gold/25 px-4 py-3 rounded-xl text-sm outline-none focus:border-gold/50 transition-colors bg-white text-charcoal placeholder-warm-gray"
      />
    </div>
  );
}
