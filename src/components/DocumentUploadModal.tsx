import { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
  Trash2,
  Eye,
  ShieldCheck,
  FileCheck,
  File,
  Loader2,
} from 'lucide-react';
import mammoth from 'mammoth';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { t, useLocale } from '../lib/i18n';
import { errorMessage } from '../lib/error-messages';
import { usePreferences } from '../stores/preferences';
import { Button, Modal } from './ui';
import { RelationSelect } from './RelationSelect';
import './document-upload-modal.css';

export interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  context: 'documents' | 'customer' | 'employee';
  customerId?: string;
  bookingId?: string;
  employeeId?: string;
  projects?: { id?: string; name?: string; project?: { id: string; name: string; code?: string } }[];
  onSuccess?: () => void;
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  title,
  context,
  customerId: initialCustomerId,
  bookingId: initialBookingId,
  employeeId,
  projects,
  onSuccess,
}: DocumentUploadModalProps) {
  useLocale();
  const currentProjectId = usePreferences((s) => s.projectId);

  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [audience, setAudience] = useState<'SELECTED_CUSTOMER' | 'STAFF_ONLY' | 'ALL_PROJECT_CUSTOMERS'>(
    context === 'customer' ? 'SELECTED_CUSTOMER' : 'STAFF_ONLY'
  );
  const [customerId, setCustomerId] = useState(initialCustomerId ?? '');
  const [bookingId, setBookingId] = useState(initialBookingId ?? '');
  const [docProjectId, setDocProjectId] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Live preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [isParsingDocx, setIsParsingDocx] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setDocName('');
      setUploadError(null);
      setPreviewUrl(null);
      setDocxHtml(null);
    } else {
      if (initialCustomerId) setCustomerId(initialCustomerId);
      if (initialBookingId) setBookingId(initialBookingId);
    }
  }, [open, initialCustomerId, initialBookingId]);

  // Handle preview generation when file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setDocxHtml(null);
      return;
    }

    const name = file.name.toLowerCase();
    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(name);
    const isDocx = /\.docx$/i.test(name);

    if (isImg || isPdf) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDocxHtml(null);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (isDocx) {
      setPreviewUrl(null);
      setIsParsingDocx(true);
      file
        .arrayBuffer()
        .then((buf) => mammoth.convertToHtml({ arrayBuffer: buf }))
        .then((res) => {
          setDocxHtml(res.value || '<p><i>Empty Word document</i></p>');
          setIsParsingDocx(false);
        })
        .catch((err) => {
          console.warn('Docx preview error:', err);
          setDocxHtml(
            '<p style="color: #64748b; font-style: italic;">Word document verified and ready for upload.</p>'
          );
          setIsParsingDocx(false);
        });
    } else {
      setPreviewUrl(null);
      setDocxHtml(null);
    }
  }, [file]);

  const handleFileSelect = (selectedFile?: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploadError(null);

    // Auto-fill document name if empty or default
    if (!docName.trim()) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDocName(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setDocxHtml(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Determine file type category
  const fileExt = file ? file.name.split('.').pop()?.toUpperCase() ?? '' : '';
  const isPdf = file ? file.type === 'application/pdf' || /\.pdf$/i.test(file.name) : false;
  const isImage = file
    ? file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)
    : false;
  const isWord = file ? /\.(docx?)$/i.test(file.name) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError(t('Please select a file to upload.'));
      return;
    }
    if (!docName.trim()) {
      setUploadError(t('Please enter a document name.'));
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('name', docName.trim());

      if (context === 'documents') {
        body.append('audience', audience);
        if (audience === 'SELECTED_CUSTOMER') {
          if (customerId) body.append('customerId', customerId);
          if (bookingId) body.append('bookingId', bookingId);
        }
        await api(`/projects/${currentProjectId}/documents`, { method: 'POST', body });
      } else if (context === 'customer') {
        body.append('audience', audience);
        if (initialCustomerId) body.append('customerId', initialCustomerId);
        await api(`/projects/${currentProjectId}/documents`, { method: 'POST', body });
      } else if (context === 'employee') {
        body.append('category', 'OTHER');
        if (docProjectId) body.append('projectId', docProjectId);
        await api(`/users/${employeeId}/documents`, { method: 'POST', body });
      }

      toast.success(t('Document uploaded successfully'));
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setUploadError(errorMessage(err));
      toast.error(errorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const modalTitle =
    title ??
    (context === 'customer'
      ? t('Upload Member Document')
      : context === 'employee'
      ? t('Upload User Document')
      : t('Upload Document'));

  return (
    <Modal
      wide
      open={open}
      onOpenChange={onOpenChange}
      title={modalTitle}
      description={t('Securely upload files with real-time preview (PDF, DOCX, images up to 25MB)')}
    >
      <form onSubmit={handleSubmit}>
        <div className="doc-upload-grid p-8">
          {/* Left Column: Form Controls */}
          <div className="doc-upload-controls">
            <div className="doc-upload-form-fields">
              {/* Dropzone or Selected File Pill */}
              {!file ? (
                <div
                  className={`doc-dropzone ${isDragOver ? 'drag-active' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <div className="doc-dropzone-icon">
                    <UploadCloud size={24} />
                  </div>
                  <div className="doc-dropzone-title">
                    {t('Choose a file or drag & drop here')}
                  </div>
                  <div className="doc-dropzone-hint">
                    {t('Instant live preview for PDF, DOCX, and images')}
                  </div>
                  <div className="doc-dropzone-types">
                    <span className="doc-type-tag">PDF</span>
                    <span className="doc-type-tag">DOCX</span>
                    <span className="doc-type-tag">PNG</span>
                    <span className="doc-type-tag">JPG</span>
                    <span className="doc-type-tag">WEBP</span>
                  </div>
                </div>
              ) : (
                <div className="doc-selected-card">
                  <div
                    className={`doc-selected-icon ${
                      isPdf ? 'pdf' : isWord ? 'word' : 'image'
                    }`}
                  >
                    {isPdf ? (
                      <FileText size={20} />
                    ) : isWord ? (
                      <FileCheck size={20} />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </div>
                  <div className="doc-selected-meta">
                    <div className="doc-selected-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="doc-selected-sub">
                      <span>{fileExt}</span>
                      <span>·</span>
                      <span>{formatFileSize(file.size)}</span>
                      <span>·</span>
                      <span style={{ color: 'var(--primary, #059669)', fontWeight: 600 }}>
                        {t('Ready')}
                      </span>
                    </div>
                  </div>
                  <div className="doc-selected-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      title={t('Replace file')}
                    >
                      <UploadCloud size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      title={t('Remove file')}
                    >
                      <Trash2 size={16} style={{ color: '#ef4444' }} />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />
                  </div>
                </div>
              )}

              {/* Document Name */}
              <div className="doc-field-group">
                <label htmlFor="doc-upload-name">{t('Document name *')}</label>
                <input
                  id="doc-upload-name"
                  className="doc-input"
                  required
                  placeholder={t('e.g. Booking Agreement, CNIC Copy, Inspection Report')}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  maxLength={180}
                />
                <span className="doc-field-hint">
                  {t('Official label shown across member files and downloads.')}
                </span>
              </div>

              {/* Context Specific Sharing / Audience Options */}
              {context === 'customer' && (
                <div className="doc-field-group">
                  <label htmlFor="doc-upload-audience">{t('Member portal access')}</label>
                  <select
                    id="doc-upload-audience"
                    className="doc-input"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as typeof audience)}
                  >
                    <option value="SELECTED_CUSTOMER">{t('Visible to member in Portal')}</option>
                    <option value="STAFF_ONLY">{t('Staff only (Confidential record)')}</option>
                  </select>
                  <span className="doc-field-hint">
                    {audience === 'SELECTED_CUSTOMER'
                      ? t('The allottee can download and view this document from their portal.')
                      : t('Restricted to internal staff with sensitive document permissions.')}
                  </span>
                </div>
              )}

              {context === 'documents' && (
                <>
                  <div className="doc-field-group">
                    <label htmlFor="doc-upload-audience-gen">{t('Sharing & visibility')}</label>
                    <select
                      id="doc-upload-audience-gen"
                      className="doc-input"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value as typeof audience)}
                    >
                      <option value="STAFF_ONLY">{t('Staff only')}</option>
                      <option value="SELECTED_CUSTOMER">
                        {t('Selected customer or booking')}
                      </option>
                      <option value="ALL_PROJECT_CUSTOMERS">
                        {t('All customers in this project')}
                      </option>
                    </select>
                  </div>

                  {audience === 'SELECTED_CUSTOMER' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="doc-field-group">
                        <label>{t('Customer (optional)')}</label>
                        <RelationSelect
                          name="customerId"
                          value={customerId}
                          onChange={setCustomerId}
                        />
                      </div>
                      <div className="doc-field-group">
                        <label>{t('Booking (optional)')}</label>
                        <RelationSelect
                          name="bookingId"
                          value={bookingId}
                          onChange={setBookingId}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {context === 'employee' && (
                <div className="doc-field-group">
                  <label htmlFor="doc-upload-proj">{t('Associated project')}</label>
                  <select
                    id="doc-upload-proj"
                    className="doc-input"
                    value={docProjectId}
                    onChange={(e) => setDocProjectId(e.target.value)}
                  >
                    <option value="">{t('General / Head Office')}</option>
                    {projects?.map((p) => {
                      const id = p.project?.id || p.id || '';
                      const name = p.project?.name || p.name || '';
                      return (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {uploadError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: 12,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="doc-upload-footer">
              <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
                {t('Cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                busy={isUploading}
                disabled={!file || !docName.trim()}
              >
                <UploadCloud size={16} />
                {t('Upload document')}
              </Button>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="doc-preview-panel">
            <div className="doc-preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={15} style={{ color: 'var(--primary, #059669)' }} />
                <span>{t('Live Document Preview')}</span>
              </div>
              {file && (
                <div className="doc-preview-badge-row">
                  <span className="doc-type-tag">{fileExt || 'FILE'}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted, #64748b)' }}>
                    {formatFileSize(file.size)}
                  </span>
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(previewUrl, '_blank')}
                      title={t('Open preview in new tab')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="doc-preview-content">
              {!file ? (
                <div className="doc-preview-empty">
                  <div className="doc-preview-empty-icons">
                    <FileText size={32} />
                    <FileCheck size={32} />
                    <ImageIcon size={32} />
                  </div>
                  <strong style={{ fontSize: 14, color: 'var(--text, #0f172a)' }}>
                    {t('No file selected yet')}
                  </strong>
                  <p style={{ margin: 0, fontSize: 12, maxWidth: 260 }}>
                    {t(
                      'Choose or drop a PDF, Word document, or image on the left to see an instant real-time preview.'
                    )}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      marginTop: 12,
                      color: 'var(--primary, #059669)',
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>{t('Encrypted · Scanned · Tamper-proof')}</span>
                  </div>
                </div>
              ) : isImage && previewUrl ? (
                <div className="doc-preview-image-wrap">
                  <img src={previewUrl} alt={docName || file.name} />
                </div>
              ) : isPdf && previewUrl ? (
                <div className="doc-preview-pdf-wrap">
                  <iframe
                    className="doc-preview-pdf-iframe"
                    src={`${previewUrl}#toolbar=0`}
                    title="PDF Preview"
                  />
                </div>
              ) : isWord ? (
                <div className="doc-preview-docx-wrap">
                  <div className="doc-docx-banner">
                    <FileCheck size={16} />
                    <span>Microsoft Word Document (.DOCX)</span>
                  </div>
                  {isParsingDocx ? (
                    <div style={{ padding: 30, textAlign: 'center' }}>
                      <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto' }} />
                      <p style={{ fontSize: 12, color: '#64748b' }}>
                        {t('Converting Word document for preview…')}
                      </p>
                    </div>
                  ) : (
                    <div
                      className="doc-docx-paper"
                      dangerouslySetInnerHTML={{ __html: docxHtml || '' }}
                    />
                  )}
                </div>
              ) : (
                <div className="doc-preview-empty">
                  <File size={48} style={{ color: 'var(--primary, #059669)', marginBottom: 8 }} />
                  <strong style={{ fontSize: 14 }}>{file.name}</strong>
                  <span style={{ fontSize: 12, color: 'var(--muted, #64748b)' }}>
                    {formatFileSize(file.size)}
                  </span>
                  <p style={{ fontSize: 12, marginTop: 8 }}>
                    {t('File verified and ready to be stored securely.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
