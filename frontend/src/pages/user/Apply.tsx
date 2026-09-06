import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DynamicForm, type FieldRule } from '../../components/DynamicForm';
import { FileDropzone, type DocumentRule } from '../../components/FileDropzone';

interface SchemeData {
  id: number;
  title: string;
  description: string;
  fields_schema: FieldRule[];
  documents_schema: DocumentRule[];
}

export const ApplyPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState<SchemeData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!schemeId) return;

    api.get<SchemeData>(`/schemes/${schemeId}`)
      .then((res) => {
        setScheme(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching scheme:', err);
        alert(err.response?.data?.detail || 'Failed to load scheme details');
        setLoading(false);
      });
  }, [schemeId]);

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileSelect = (docName: string, file: File | null, error?: string) => {
    if (error) {
      setErrors((prev) => ({ ...prev, [docName]: error }));
      return;
    }
    if (file) {
      setFiles((prev) => ({ ...prev, [docName]: file }));
      setErrors((prev) => ({ ...prev, [docName]: '' }));
    } else {
      const updated = { ...files };
      delete updated[docName];
      setFiles(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheme) return;

    const newErrors: Record<string, string> = {};

    // 1. Dynamic Form Field Validations
    scheme.fields_schema.forEach((rule: FieldRule) => {
      const val = formValues[rule.name];

      // Required check
      if (rule.required && (val === undefined || val === null || val === '')) {
        newErrors[rule.name] = `${rule.label} is required`;
      } else if (val !== undefined && val !== null && val !== '') {
        // Numeric max_value limit check (e.g. Income <= ₹6,00,000)
        if (rule.field_type === 'number' && rule.max_value != null) {
          if (Number(val) > Number(rule.max_value)) {
            newErrors[rule.name] = `${rule.label} cannot exceed ₹${Number(rule.max_value).toLocaleString()}`;
          }
        }

        // Numeric min_value limit check
        if (rule.field_type === 'number' && rule.min_value != null) {
          if (Number(val) < Number(rule.min_value)) {
            newErrors[rule.name] = `${rule.label} must be at least ₹${Number(rule.min_value).toLocaleString()}`;
          }
        }

        // Regex Validation (e.g. Phone Number, PAN, Aadhaar)
        if (rule.validation_regex) {
          try {
            const regex = new RegExp(rule.validation_regex);
            if (!regex.test(String(val))) {
              newErrors[rule.name] = `Invalid format for ${rule.label}`;
            }
          } catch (regexErr) {
            console.error(`Invalid regex rule for field ${rule.name}:`, regexErr);
          }
        }
      }
    });

    // 2. Required Document Checks
    scheme.documents_schema.forEach((doc: DocumentRule) => {
      if (doc.required && !files[doc.doc_name]) {
        newErrors[doc.doc_name] = `${doc.doc_name} is mandatory`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('user_id', userId || '1');
    formData.append('form_data', JSON.stringify(formValues));

    // Rename files so backend can map them directly: DocName_filename.ext
    Object.entries(files).forEach(([docName, file]) => {
      const sanitizedDocName = docName.replace(/[^a-zA-Z0-9]/g, '_');
      const renamedFile = new File([file], `${sanitizedDocName}_${file.name}`, {
        type: file.type,
      });
      formData.append('files', renamedFile);
    });

    try {
      await api.post(`/applications/apply/${schemeId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Application submitted successfully!');
      navigate('/');
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert(err.response?.data?.detail || 'Submission failed. Please check your documents.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-sm text-zinc-500">
        Loading Scheme details...
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-sm text-zinc-500">
        Scheme not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {/* Scheme Header Information */}
      <div className="border-b border-zinc-200 pb-6">
        <span className="text-xs uppercase font-mono tracking-widest text-zinc-400">
          Application Form
        </span>
        <h1 className="text-2xl font-bold text-black mt-1 tracking-tight">
          {scheme.title}
        </h1>
        <p className="text-sm text-zinc-600 mt-2 leading-relaxed whitespace-pre-line">
          {scheme.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dynamic Fields Section */}
        {scheme.fields_schema.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-black uppercase tracking-wider text-xs">
              1. Applicant & Business Information
            </h2>
            <div className="border border-zinc-200 p-6 rounded bg-white">
              <DynamicForm
                fields={scheme.fields_schema}
                values={formValues}
                onChange={handleFieldChange}
                errors={errors}
              />
            </div>
          </div>
        )}

        {/* Dynamic Documents Section */}
        {scheme.documents_schema.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-black uppercase tracking-wider text-xs">
              2. Required Document Attachments
            </h2>
            <div className="border border-zinc-200 p-6 rounded bg-white">
              <FileDropzone
                documents={scheme.documents_schema}
                files={files}
                onFileSelect={handleFileSelect}
                errors={errors}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-3 rounded text-sm font-medium hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors cursor-pointer"
        >
          {submitting ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};