export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type SessionStatus = 'draft' | 'ready' | 'archived';

export interface ProductionSession {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  status: SessionStatus;
  preview_camera_id: string | null;
  program_camera_id: string | null;
  created_at: string;
  updated_at: string;
}

export type CameraStatus = 'offline' | 'online';

export interface Camera {
  id: string;
  session_id: string;
  owner_id: string;
  name: string;
  join_token: string;
  status: CameraStatus;
  device_label: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export type StreamPlatform = 'youtube' | 'twitch' | 'facebook' | 'custom_rtmp';

export interface StreamDestination {
  id: string;
  session_id: string;
  owner_id: string;
  name: string;
  platform: StreamPlatform;
  rtmp_url: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type RecordingStatus = 'processing' | 'ready' | 'failed';

export interface Recording {
  id: string;
  session_id: string | null;
  owner_id: string;
  title: string;
  storage_path: string | null;
  duration_seconds: number | null;
  size_bytes: number | null;
  status: RecordingStatus;
  created_at: string;
  updated_at: string;
}
