import React, { useState } from 'react';
import { Globe, User as UserIcon, Mail, Lock, Phone, MapPin, Calendar, GraduationCap, Award, Building2, ArrowRight } from 'lucide-react';
import { useStore } from '../App';
import { cn } from '../utils/cn';

export function Auth() {
  const { login, register, destinations, visaTypes } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'USER' | 'AGENT'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    whatsapp: '',
    address: '',
    mailingAddress: '',
    maritalStatus: 'Single',
    gender: 'Male',
    age: '',
    dob: '',
    nationality: '',
    currentLivingCountry: '',
    targetCountry: '',
    visaType: '',
    educationLevel: '',
    englishScore: '',
    passportNumber: '',
    agencyName: '',
    licenseNumber: '',
    yearsExperience: '',
    countriesSupported: '',
    languagesSpoken: '',
    bio: '',
    availability: 'Mon-Fri: 9AM - 5PM',
    visaTypesSupported: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (!success) setIsLoading(false);
    } else {
      const success = await register({
        ...formData,
        role: role,
        name: formData.fullName
      });
      if (!success) setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden py-12 px-4">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="mb-12 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-[1.5rem] text-primary mb-6 transition-transform hover:scale-110 duration-500">
          <Globe size={40} />
        </div>
        <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
          Migrate<span className="text-primary">Hub</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
          The World's Most Advanced Migration CRM
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-3xl relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white dark:border-slate-800 p-8 sm:p-12 transition-all duration-500 hover:shadow-2xl">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isLogin ? 'Enter your credentials to access your secure dashboard' : 'Fill in the details to start your migration journey'}
            </p>
          </div>

          {!isLogin && (
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-10">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  role === 'USER' ? "bg-white dark:bg-slate-700 text-primary shadow-lg" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <UserIcon size={18} /> Client
              </button>
              <button
                type="button"
                onClick={() => setRole('AGENT')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  role === 'AGENT' ? "bg-white dark:bg-slate-700 text-primary shadow-lg" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <Award size={18} /> Agent
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={cn("grid grid-cols-1 gap-6", !isLogin && "max-h-[500px] overflow-y-auto pr-2 sm:grid-cols-2 scrollbar-thin")}>
              {!isLogin && (
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-medium" />
                  </div>
                </div>
              )}

              <div className={cn("space-y-2", isLogin && "sm:col-span-2")}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input required name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-medium" />
                </div>
              </div>

              <div className={cn("space-y-2", isLogin && "sm:col-span-2")}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white font-medium" />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="+1..." className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary dark:text-white font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+1..." className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary dark:text-white font-medium" />
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required name="address" value={formData.address} onChange={handleChange} placeholder="Street, City, Country" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary dark:text-white font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary dark:text-white font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                    <input required type="number" name="age" value={formData.age} onChange={handleChange} placeholder="25" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nationality</label>
                    <input required name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g. British" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Living In</label>
                    <input required name="currentLivingCountry" value={formData.currentLivingCountry} onChange={handleChange} placeholder="Current Country" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  {role === 'USER' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination</label>
                        <select name="targetCountry" value={formData.targetCountry} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium">
                          <option value="">Select Target</option>
                          {destinations.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visa Type</label>
                        <select name="visaType" value={formData.visaType} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium">
                          <option value="">Select Category</option>
                          {visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Education</label>
                        <div className="relative group">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input name="educationLevel" value={formData.educationLevel} onChange={handleChange} placeholder="Degree Name" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary dark:text-white font-medium" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">English Score</label>
                        <input name="englishScore" value={formData.englishScore} onChange={handleChange} placeholder="IELTS / PTE / etc." className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passport Number</label>
                        <input name="passportNumber" value={formData.passportNumber} onChange={handleChange} placeholder="E-Passport Number" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agency Name</label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required name="agencyName" value={formData.agencyName} onChange={handleChange} placeholder="Company Name" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary dark:text-white font-medium" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License No.</label>
                        <div className="relative group">
                          <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="LIC-12345" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary dark:text-white font-medium" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exp. Years</label>
                        <input required name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} placeholder="e.g. 5" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Languages</label>
                        <input required name="languagesSpoken" value={formData.languagesSpoken} onChange={handleChange} placeholder="English, Hindi, etc." className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supported Visas</label>
                        <input name="visaTypesSupported" value={formData.visaTypesSupported} onChange={handleChange} placeholder="Student, Skilled, etc." className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability</label>
                        <input name="availability" value={formData.availability} onChange={handleChange} placeholder="Mon-Sat: 10AM-6PM" className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium" />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Describe your migration expertise..." className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-primary dark:text-white font-medium h-24 resize-none" />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 group transition-all active:scale-[0.98] disabled:opacity-70 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Register Now'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 dark:text-slate-400 font-bold hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto group"
            >
              {isLogin ? "New to MigrateHub?" : "Already have an account?"}
              <span className="text-primary group-hover:underline">{isLogin ? 'Create Account' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
