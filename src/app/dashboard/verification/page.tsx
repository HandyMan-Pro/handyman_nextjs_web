'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  Shield, ShieldAlert, ShieldCheck, FileText,
  Loader2, X, Upload, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function VerificationPage() {
  const authStatus = useAuthStore(state => state.verification_status);
  const authUser = useAuthStore(state => state.user);
  const fetchUser = useAuthStore(state => state.fetchUser);
  const setVerificationStatus = useAuthStore(state => state.setVerificationStatus);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Form Inputs
  const [idProofType, setIdProofType] = useState('Passport');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [newDocumentUrl, setNewDocumentUrl] = useState('');

  const verificationStatus = authStatus || 'unverified';
  const rejectionReason = (authUser as any)?.verification_rejection_reason || '';

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchUser();
      setLoading(false);
    };
    init();
  }, [fetchUser]);

  useEffect(() => {
    if (authUser) {
      setIdProofType((authUser as any).id_proof_type || 'Passport');
      setIdProofNumber((authUser as any).id_proof_number || '');
      setDocuments((authUser as any).documents || []);
    }
  }, [authUser]);

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
        await fetchUser();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit verification details.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormDisabled = verificationStatus === 'pending' || verificationStatus === 'verified';

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

          {/* 3. Verification Submission Form */}
          <div className={`bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 shadow-xl space-y-6 ${isFormDisabled ? 'opacity-60' : ''}`}>
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
                    disabled={isFormDisabled}
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                    className="w-full h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/60 disabled:cursor-not-allowed"
                  >
                    <option value="Passport">Passport</option>
                    <option value="NID">National ID (NID)</option>
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
                    disabled={isFormDisabled}
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value)}
                    placeholder="e.g. PPT-1234567"
                    className="w-full h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block animate-fade-in">
                  Drag and Drop File Upload Proofs
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isFormDisabled) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (isFormDisabled) return;
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      const mockUrls = files.map(file => `https://handyman-pro.s3.amazonaws.com/verifications/${Date.now()}_${file.name}`);
                      setDocuments([...documents, ...mockUrls]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-750 text-zinc-400'
                  } ${isFormDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                  <p className="text-sm font-semibold">Drag and drop your ID document here</p>
                  <p className="text-xs text-zinc-500 mt-1">Supports PDF, JPG, PNG (Max 5MB)</p>
                  <input
                    type="file"
                    disabled={isFormDisabled}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        const mockUrls = files.map(file => `https://handyman-pro.s3.amazonaws.com/verifications/${Date.now()}_${file.name}`);
                        setDocuments([...documents, ...mockUrls]);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className={`mt-4 inline-flex h-9 px-4 items-center justify-center bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold rounded-lg text-xs transition-all ${
                      isFormDisabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }`}
                  >
                    Select Files
                  </label>
                </div>
              </div>

              {/* Document URL addition */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Or Add ID Proof Documents via URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isFormDisabled}
                    value={newDocumentUrl}
                    onChange={(e) => setNewDocumentUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/my-passport.jpg"
                    className="flex-1 h-11 px-3 bg-zinc-850/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={isFormDisabled}
                    onClick={handleAddDocument}
                    className="h-11 px-4 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:cursor-not-allowed"
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
                          disabled={isFormDisabled}
                          onClick={() => handleRemoveDocument(idx)}
                          className="p-1 text-zinc-500 hover:text-rose-450 transition-colors disabled:cursor-not-allowed"
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
                  disabled={submitting || isFormDisabled}
                  className="h-11 px-8 bg-primary hover:bg-primary/95 text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-primary/10 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Verification Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
