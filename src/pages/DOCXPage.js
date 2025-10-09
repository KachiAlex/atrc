import React, { useState } from 'react';
import DOCXReader from '../components/DOCXReader';

const DOCXPage = () => {
  const [docxUrl, setDocxUrl] = useState('');
  const [open, setOpen] = useState(false);

  const onOpen = () => {
    if (!docxUrl) return;
    setOpen(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">DOCX Translator</h2>
      <p className="text-sm text-gray-600 mb-4">Paste a public DOCX URL (e.g., from Google Drive with anyone-with-link access) and click Open.</p>
      <div className="flex gap-3">
        <input
          type="url"
          placeholder="https://.../your.docx"
          value={docxUrl}
          onChange={(e) => setDocxUrl(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={onOpen} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Open</button>
      </div>

      {open && (
        <DOCXReader
          docxUrl={docxUrl}
          title="DOCX Document"
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default DOCXPage;


