import React from 'react';

export interface DocumentRule {
  doc_name: string;
  allowed_types: string[]; // e.g. ['jpg', 'png', 'pdf']
  max_size_kb: number;     // e.g. 200 for 200KB
  required: boolean;
}

interface FileDropzoneProps {
  documents: DocumentRule[];
  files: Record<string, File>;
  onFileSelect: (docName: string, file: File | null, error?: string) => void;
  errors: Record<string, string>;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ documents, files, onFileSelect, errors }) => {
  const handleFileChange = (doc: DocumentRule, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      onFileSelect(doc.doc_name, null);
      return;
    }

    // 1. Validate file extension
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!doc.allowed_types.includes(ext)) {
      onFileSelect(doc.doc_name, null, `Invalid file type. Allowed: ${doc.allowed_types.join(', ').toUpperCase()}`);
      return;
    }

    // 2. Validate file size in KB
    const sizeKb = selectedFile.size / 1024;
    if (sizeKb > doc.max_size_kb) {
      onFileSelect(doc.doc_name, null, `File exceeds max size of ${doc.max_size_kb} KB (Selected file: ${Math.round(sizeKb)} KB)`);
      return;
    }

    onFileSelect(doc.doc_name, selectedFile);
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.doc_name} className="border border-zinc-200 rounded p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-black">
              {doc.doc_name} {doc.required && <span className="text-red-500">*</span>}
            </span>
            <span className="text-xs text-zinc-500">
              Max {doc.max_size_kb} KB ({doc.allowed_types.join(', ').toUpperCase()})
            </span>
          </div>

          <input
            type="file"
            accept={doc.allowed_types.map((t) => `.${t}`).join(',')}
            onChange={(e) => handleFileChange(doc, e)}
            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:bg-black file:text-white file:rounded hover:file:bg-zinc-800 cursor-pointer"
          />

          {files[doc.doc_name] && (
            <span className="text-xs text-emerald-600 font-medium">✓ Selected: {files[doc.doc_name].name}</span>
          )}

          {errors[doc.doc_name] && (
            <span className="text-xs text-red-600 font-medium">{errors[doc.doc_name]}</span>
          )}
        </div>
      ))}
    </div>
  );
};