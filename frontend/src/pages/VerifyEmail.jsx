import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import PocketPaiseLogo from '../components/PocketPaiseLogo';
import { authAPI } from '../api/client';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const doVerify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
      } catch (e) {
        setStatus('error');
      }
    };
    doVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#faf5f0] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ebdcd3] p-8 shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <PocketPaiseLogo size="md" />
        </div>

        {status === 'verifying' && (
          <div>
            <p className="text-sm font-semibold text-stone-700">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-stone-800">Email Verified!</h2>
            <p className="text-xs text-stone-500 mt-1">Your Pocket Paise account is active and verified.</p>
            <Link
              to="/login"
              className="mt-5 inline-block px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold"
            >
              Log In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-stone-800">Verification Link Expired</h2>
            <p className="text-xs text-stone-500 mt-1">This verification link is invalid or has expired.</p>
            <Link
              to="/login"
              className="mt-5 inline-block px-6 py-2.5 rounded-full bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
