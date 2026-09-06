import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { FieldRule } from '../../components/DynamicForm';
import type { DocumentRule } from '../../components/FileDropzone';

export const SchemeBuilder: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldRule[]>([]);
  const [documents, setDocuments] = useState<DocumentRule[]>([]);

  // Temp state for new field
  const [fName, setFName] = useState('');
  const [fLabel, setFLabel] = useState('');
  const [fType, setFType] = useState('text');
  const [fRegex, setFRegex] = useState('');
  const [fMaxValue, setFMaxValue] = useState<string>('');

  // Temp state for new document requirement
  const [docName, setDocName] = useState('');
  const [docTypes, setDocTypes] = useState('jpg,jpeg,png');
  const [maxSizeKb, setMaxSizeKb] = useState<number>(200);

  const addField = () => {
    if (!fName || !fLabel) return;
    setFields([
      ...fields,
      {
        name: fName.toLowerCase().replace(/\s+/g, '_'),
        label: fLabel,
        field_type: fType,
        required: true,
        validation_regex: fRegex || undefined,
        max_value: fMaxValue ? Number(fMaxValue) : undefined,
      },
    ]);
    setFName('');
    setFLabel('');
    setFRegex('');
    setFMaxValue('');
  };

  const addDocument = () => {
    if (!docName) return;
    setDocuments([
      ...documents,
      {
        doc_name: docName,
        allowed_types: docTypes.split(',').map((s) => s.trim().toLowerCase()),
        max_size_kb: Number(maxSizeKb),
        required: true,
      },
    ]);
    setDocName('');
  };

  const handlePublish = async () => {
    if (!title || !description) {
      alert('Please fill out Scheme Title and Description.');
      return;
    }
    try {
      await api.post('/schemes/', {
        title,
        description,
        fields_schema: fields,
        documents_schema: documents,
      });
      alert('Scheme Published Successfully!');
      setTitle('');
      setDescription('');
      setFields([]);
      setDocuments([]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to publish scheme');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Admin: Scheme & Approval Builder</h1>
        <p className="text-sm text-zinc-500">Configure dynamic approvals, validation rules, and document requirements.</p>
      </div>

      {/* 1. General Information */}
      <div className="space-y-4 border border-zinc-200 p-6 rounded">
        <h2 className="text-lg font-semibold text-black">1. General Information</h2>
        <input
          placeholder="Scheme Title (e.g. ₹3 Lakh Grant for Steel Manufacturing Units)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        <textarea
          placeholder="Detailed Description / Eligibility Criteria"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-zinc-300 rounded px-3 py-2 text-sm h-28 focus:outline-none focus:border-black"
        />
      </div>

      {/* 2. Dynamic Form Fields */}
      <div className="space-y-4 border border-zinc-200 p-6 rounded">
        <h2 className="text-lg font-semibold text-black">2. Dynamic Form Fields</h2>
        <div className="grid grid-cols-5 gap-2">
          <input
            placeholder="Field ID (e.g. phone)"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
          <input
            placeholder="Label (e.g. Mobile Number)"
            value={fLabel}
            onChange={(e) => setFLabel(e.target.value)}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
          <select
            value={fType}
            onChange={(e) => setFType(e.target.value)}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-black"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </select>
          <input
            placeholder="Regex (e.g. ^[0-9]{10}$)"
            value={fRegex}
            onChange={(e) => setFRegex(e.target.value)}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
          <input
            type="number"
            placeholder="Max Value (e.g. 600000)"
            value={fMaxValue}
            onChange={(e) => setFMaxValue(e.target.value)}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <button
          onClick={addField}
          type="button"
          className="bg-black text-white px-4 py-1.5 rounded text-xs hover:bg-zinc-800 transition-colors"
        >
          + Add Field
        </button>

        {fields.length > 0 && (
          <ul className="divide-y divide-zinc-200 border-t border-zinc-200 mt-2 pt-2 text-sm">
            {fields.map((f) => (
              <li key={f.name} className="py-2 flex justify-between text-zinc-700">
                <span>
                  <strong>{f.label}</strong> (<code className="text-xs bg-zinc-100 px-1 py-0.5">{f.name}</code>) - {f.field_type}
                </span>
                <span className="text-xs text-zinc-500">
                  {f.max_value ? `Max: ₹${f.max_value.toLocaleString()}` : ''} {f.validation_regex ? `[Regex: ${f.validation_regex}]` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. Required Documents */}
      <div className="space-y-4 border border-zinc-200 p-6 rounded">
        <h2 className="text-lg font-semibold text-black">3. Required Documents</h2>
        <div className="grid grid-cols-3 gap-2">
          <input
            placeholder="Document Name (e.g. Aadhaar Card Photo)"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
          <input
            placeholder="Allowed Types (e.g. jpg,jpeg,png)"
            value={docTypes}
            onChange={(e) => setDocTypes(e.target.value)}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
          <input
            type="number"
            placeholder="Max Size (KB) e.g. 200"
            value={maxSizeKb}
            onChange={(e) => setMaxSizeKb(Number(e.target.value))}
            className="border border-zinc-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <button
          onClick={addDocument}
          type="button"
          className="bg-black text-white px-4 py-1.5 rounded text-xs hover:bg-zinc-800 transition-colors"
        >
          + Add Document Requirement
        </button>

        {documents.length > 0 && (
          <ul className="divide-y divide-zinc-200 border-t border-zinc-200 mt-2 pt-2 text-sm">
            {documents.map((d) => (
              <li key={d.doc_name} className="py-2 flex justify-between text-zinc-700">
                <span><strong>{d.doc_name}</strong></span>
                <span className="text-xs text-zinc-500">Max {d.max_size_kb} KB ({d.allowed_types.join(', ').toUpperCase()})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handlePublish}
        className="w-full bg-black text-white py-3 rounded text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        Publish Scheme to Portal
      </button>

      {/* 4. User Role Management */}
      <UserRoleManager />
    </div>
  );
};

const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = () => {
    api.get('/auth/users').then((res) => setUsers(res.data)).catch(console.error);
  };

  useEffect(() => { loadUsers(); }, []);

  const changeRole = async (userId: number, role: string) => {
    try {
      await api.patch(`/auth/users/${userId}/role`, { role });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-4 border border-zinc-200 p-6 rounded mt-8">
      <h2 className="text-lg font-semibold text-black">4. Manage User Roles</h2>
      <p className="text-xs text-zinc-500">Promote registered citizen users to Government Reviewers (or demote them).</p>

      <div className="divide-y divide-zinc-200 border-t border-zinc-200 mt-2">
        {users.length === 0 ? (
          <div className="py-4 text-xs text-zinc-400">No registered users found.</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="py-3 flex justify-between items-center text-sm">
              <div>
                <span className="font-medium text-black">{u.email}</span>
                <span className="text-xs ml-2 uppercase px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                  {u.role}
                </span>
              </div>
              {u.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => changeRole(u.id, u.role === 'gov_employee' ? 'user' : 'gov_employee')}
                  className="border border-zinc-300 text-xs px-3 py-1 rounded hover:bg-zinc-100 transition-colors"
                >
                  {u.role === 'gov_employee' ? 'Demote to Citizen User' : 'Promote to Gov Employee'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};