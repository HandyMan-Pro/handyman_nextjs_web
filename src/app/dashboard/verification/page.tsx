'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData, setUserData } from '../../../lib/auth';
import {
  Shield, ShieldAlert, ShieldCheck, FileText,
  Loader2, X, Upload, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function VerificationPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Provider Data
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
  const [rejectionReason, setRejectionReason] = useState('');
  const [idProofType, setIdProofType] = useState('Passport');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [newDocumentUrl, setNewDocumentUrl] = useState('');

  useEffect(() => {
    fetchVerificationDetails();
  }, []);

  const fetchVerificationDetails = async () => {
    setLoading(true);
    setError('');
    const user = getUserData();
    if (!user) {
      setError('Failed to resolve authenticated session.');
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get(`/user-detail?id=${user.id}`);
      const data = res.data?.data || res.data;
      if (data) {
        setVerificationStatus(data.verification_status || 'unverified');
        setRejectionReason(data.verification_rejection_reason || '');
        setIdProofType(data.id_proof_type || 'Passport');
        setIdProofNumber(data.id_proof_number || '');
        setDocuments(data.documents || []);

        // Sync with local storage
        setUserData({
          ...user,
          ...data
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch verification status.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocumentUrl.trim()) return;
    if (!newDocumentUrl.startsWith('http://') && !newDocumentUrl.startsWith('https://')) {
      setError('Document path must be a valid URL.');
      return;
    }
    setDocuments([...documents, newDocumentUrl.trim()]);
    setNewDocumentUrl('');
    setError('');
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (documents.length === 0) {
      setError('Please add at least one proof document URL.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await apiClient.post('/provider/id-verification', {
        id_proof_type: idProofType,
        id_proof_number: idProofNumber,
        documents: documents
      });

      if (res.data?.status) {
        setSuccessMsg(res.data.message || 'Verification details submitted successfully!');
        setVerificationStatus('pending');
        // Retrieve fresh user info
        fetchVerificationDetails();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit verification details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary animate-pulse" />
          Provider ID Verification
        </h1>
        <p className="text-zinc-400 text-sm mt-0.5 font-medium">
          Verify your identity to get the Verified badge on your profile and build customer trust.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-in flex justify-between items-center">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-450" />
            {error}
          </span>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 space-y-6 animate-pulse">
          <div className="h-16 bg-zinc-800 rounded-xl" />
          <div className="h-40 bg-zinc-800 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Status Banners */}
          {verificationStatus === 'unverified' && (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700/50">
                  <ShieldAlert className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-200">Account Unverified</h3>
                  <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                    Your account is currently unverified. Please submit your identity verification proof below to unlock full provider capabilities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === 'pending' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-400">Verification Request Pending</h3>
                  <p className="text-sm text-zinc-300 mt-1 max-w-xl">
                    We are currently reviewing your submitted verification proof. This process typically takes 24 to 48 hours. Thank you for your patience!
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === 'verified' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-450">Identity Verified</h3>
                  <p className="text-sm text-zinc-300 mt-1 max-w-xl">
                    Congratulations! Your identity has been successfully verified. A verification badge is now displayed on your profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === 'rejected' && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <ShieldAlert className="w-6 h-6 text-rose-450" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-rose-450">Verification Request Rejected</h3>
                  <p className="text-sm text-zinc-300">
                    Your previous ID verification request was rejected by the admin.
                  </p>
                  {rejectionReason && (
                    <div className="mt-2 text-sm text-rose-300 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                      <span className="font-semibold text-rose-400">Reason:</span> {rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. Submitted Document Details Display (if not unverified) */}
          {verificationStatus !== 'unverified' && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-350 uppercase tracking-wider">Submitted Document Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                  <span className="text-xs text-zinc-500 block mb-1">ID Proof Type</span>
                  <span className="text-sm font-bold text-zinc-200">{idProofType}</span>
                </div>
                <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                  <span className="text-xs text-zinc-500 block mb-1">ID Proof Number</span>
                  <span className="text-sm font-bold text-zinc-200 font-mono">{idProofNumber}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block mb-2">Uploaded Document Proofs</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl hover:border-primary/45 transition-all group"
                    >
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs text-zinc-400 truncate group-hover:text-zinc-200">
                        {doc.split('/').pop() || `Document_${idx + 1}`}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Verification Submission Form (shown if unverified or rejected) */}
          {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="border-b border-zinc-850 pb-4">
                <h3 className="text-lg font-bold text-zinc-250">Submit Identification Details</h3>
                <p className="text-xs text-zinc-550 mt-1">
                  Provide correct information and clear documents to prevent review rejection.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                      ID Proof Document Type
                    </label>
                    <select
                      value={idProofType}
                      onChange={(e) => setIdProofType(e.target.value)}
                      className="w-full h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/60"
                    >
                      <option value="Passport">Passport</option>
                      <option value="National ID">National ID Card</option>
                      <option value="Trade License">Trade License</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                      ID Document Number
                    </label>
                    <input
                      type="text"
                      required
                      value={idProofNumber}
                      onChange={(e) => setIdProofNumber(e.target.value)}
                      placeholder="e.g. PPT-1234567"
                      className="w-full h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/60"
                    />
                  </div>
                </div>

                {/* Document URL addition */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Upload Identification Proofs (URLs)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDocumentUrl}
                      onChange={(e) => setNewDocumentUrl(e.target.value)}
                      placeholder="e.g. https://domain.com/my-passport.jpg"
                      className="flex-1 h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/60"
                    />
                    <button
                      type="button"
                      onClick={handleAddDocument}
                      className="h-11 px-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-zinc-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>

                  {/* Document List */}
                  {documents.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs text-zinc-400 truncate">{doc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(idx)}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-8 bg-primary hover:bg-primary/95 text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-primary/10"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Verification Details
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
