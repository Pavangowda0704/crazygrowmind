import api from '../api/axios';

// Tries the native share sheet with the actual PDF file first (works well
// on mobile — the client picks WhatsApp/Email/Drive/etc. themselves).
// Falls back to a public, no-login share link (works on desktop and any
// browser without file-sharing support), copies it to the clipboard, and
// opens WhatsApp Web with the link pre-filled as a convenience.
//
// `kind` is 'invoice' or 'booking' — matches the /:kind/:id/share route.
export async function sharePdfDocument({ kind, id, filename, pdfBlob, whatsappText }) {
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return { method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') return { method: 'cancelled' };
      // any other failure — fall through to link-based sharing below
    }
  }

  const { data } = await api.post(`/${kind}s/${id}/share`);
  const url = data.url;

  let copied = false;
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch (e) {
      // clipboard write can fail (permissions) — link still opens below
    }
  }

  const waText = encodeURIComponent(`${whatsappText}\n${url}`);
  window.open(`https://wa.me/?text=${waText}`, '_blank');

  return { method: 'link', url, copied };
}
