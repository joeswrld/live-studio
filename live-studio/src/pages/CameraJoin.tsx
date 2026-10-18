import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, CameraOff } from 'lucide-react';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ErrorNotice, Spinner } from '@/components/ui/Feedback';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { VideoMonitor } from '@/components/studio/VideoMonitor';
import { Logo } from '@/components/layout/Logo';

interface CameraInfo {
  camera_id: string;
  camera_name: string;
  session_name: string;
}

const HEARTBEAT_MS = 20_000;

function deviceLabel(): string {
  const ua = navigator.userAgent;
  const kind = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return `${kind} · ${browser}`;
}

/** Public page opened on the camera device. Reports presence; shows a LOCAL preview only. */
export default function CameraJoin() {
  const { token = '' } = useParams();
  const [info, setInfo] = useState<CameraInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const label = useRef(deviceLabel());

  useEffect(() => {
    let active = true;
    supabase.rpc('get_camera_by_token', { p_token: token }).then(({ data, error: err }) => {
      if (!active) return;
      const row = Array.isArray(data) ? (data[0] as CameraInfo | undefined) : undefined;
      if (err) setError(err.message);
      else if (!row) setError('This join link is invalid or the camera was deleted.');
      else setInfo(row);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [token]);

  const setPresence = useCallback(
    async (online: boolean) => {
      const { error: err } = await supabase.rpc('set_camera_presence', { p_token: token, p_online: online, p_device_label: label.current });
      if (err) setError(err.message);
    },
    [token],
  );

  // While connected: heartbeat, and mark offline when the page is closed.
  useEffect(() => {
    if (!connected) return;
    const beat = window.setInterval(() => void setPresence(true), HEARTBEAT_MS);
    const goOffline = () => {
      void fetch(`${SUPABASE_URL}/rest/v1/rpc/set_camera_presence`, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ p_token: token, p_online: false, p_device_label: label.current }),
      });
    };
    window.addEventListener('pagehide', goOffline);
    return () => {
      window.clearInterval(beat);
      window.removeEventListener('pagehide', goOffline);
    };
  }, [connected, setPresence, token]);

  // Stop local capture when leaving.
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const connect = async () => {
    setMediaError(null);
    await setPresence(true);
    setConnected(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setStream(media);
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : 'Camera access was blocked.');
    }
  };

  const disconnect = async () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setConnected(false);
    await setPresence(false);
  };

  return (
    <div className="flex min-h-full flex-col items-center px-4 py-8">
      <Logo to="/" />
      <div className="panel mt-6 w-full max-w-md p-5">
        {loading ? (
          <Spinner />
        ) : !info ? (
          <ErrorNotice message={error ?? 'Camera not found.'} />
        ) : (
          <>
            <p className="text-xs uppercase tracking-wider text-slate-500">{info.session_name}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <h1 className="truncate text-lg font-semibold text-white">{info.camera_name}</h1>
              <StatusIndicator tone={connected ? 'ok' : 'idle'} label={connected ? 'Connected' : 'Not connected'} pulse={connected} />
            </div>
            <div className="mt-4">
              <VideoMonitor kind="camera" stream={stream} emptyMessage={connected ? 'Camera preview unavailable' : 'Preview off'} />
            </div>
            <p className="mt-2 text-xs text-slate-500">This is a local preview on your device. Video is not sent to the studio in this version; only your online status is.</p>
            {error && <div className="mt-3"><ErrorNotice message={error} /></div>}
            {mediaError && <div className="mt-3"><ErrorNotice message={`Camera access: ${mediaError}`} /></div>}
            <div className="mt-4">
              {connected ? (
                <Button className="w-full" onClick={() => void disconnect()}>
                  <CameraOff className="h-4 w-4" /> Disconnect
                </Button>
              ) : (
                <Button variant="primary" className="w-full" onClick={() => void connect()}>
                  <Camera className="h-4 w-4" /> Connect this camera
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
