import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const LandingPage: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schemes/')
      .then((res) => {
        setSchemes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-bold text-black tracking-tight">Industrial Schemes & Approvals</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Browse active government support programs, subsidies, and clearance approvals.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-500">Loading published schemes...</div>
      ) : schemes.length === 0 ? (
        <div className="border border-dashed border-zinc-300 rounded p-12 text-center">
          <p className="text-sm text-zinc-600 font-medium">No approval schemes published yet.</p>
          <p className="text-xs text-zinc-400 mt-1">Sign in as an Admin to create and publish new approval schemes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((s) => (
            <div key={s.id} className="border border-zinc-200 rounded p-6 flex flex-col justify-between hover:border-black transition-colors">
              <div>
                <h2 className="text-lg font-bold text-black">{s.title}</h2>
                <p className="text-xs text-zinc-600 mt-2 line-clamp-3 leading-relaxed">{s.description}</p>
                <div className="mt-4 flex gap-4 text-xs text-zinc-500">
                  <span>Required Fields: <strong>{s.fields_schema.length}</strong></span>
                  <span>Required Docs: <strong>{s.documents_schema.length}</strong></span>
                </div>
              </div>

              <Link
                to={`/apply/${s.id}`}
                className="mt-6 inline-block text-center bg-black text-white text-xs font-medium py-2 rounded hover:bg-zinc-800 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};