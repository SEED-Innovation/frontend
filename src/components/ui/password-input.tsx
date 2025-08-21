import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const PasswordInput = ({ ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className="h-12 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 pr-10 transition-all duration-300"
      />
      <motion.button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors duration-200"
        onClick={() => setShowPassword(!showPassword)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </motion.button>
    </div>
  );
};

export { PasswordInput };