import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export const ReviewQueue: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);

  const fetchApplications = () => {
    api.get('/applications/all')
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Government Review Portal</h1>
        <p className="text-sm text-zinc-500">Review dynamic applications, inspect documents, and grant approvals.</p>
      </div>

      <div className="border border-zinc-200 rounded divide-y divide-zinc-200">
        {applications.length === 0 ? (
          <div className="p-6 text-sm text-zinc-500 text-center">No applications submitted yet.</div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-zinc-400">Application #{app.id} (Scheme ID: {app.scheme_id})</span>
                  <div className="text-sm font-semibold text-black mt-1">Status: <span className="uppercase">{app.status}</span></div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(app.id, 'Approved')}
                    className="bg-black text-white px-3 py-1 text-xs rounded hover:bg-zinc-800"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, 'Rejected')}
                    className="border border-zinc-300 text-black px-3 py-1 text-xs rounded hover:bg-zinc-100"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Dynamic form responses */}
              <div className="bg-zinc-50 p-4 rounded text-xs space-y-1">
                <span className="font-semibold text-zinc-700">Form Submission Data:</span>
                <pre className="text-zinc-600 font-mono mt-1 overflow-x-auto">
                  {JSON.stringify(app.form_data, null, 2)}
                </pre>
              </div>

              {/* Uploaded documents links */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-zinc-700">Uploaded Documents:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(app.document_paths).map(([docKey, filePath]) => (
                    <a
                      key={docKey}
                      href={`http://localhost:8000/${filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-zinc-300 rounded px-2 py-1 hover:bg-zinc-100 text-black underline"
                    >
                      {docKey} (View File)
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};