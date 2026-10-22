import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Song } from '../types';

export interface AdminActivity {
  id: number;
  action: string;
  details: Record<string, string | number>;
  created_at: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const client: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

function requireClient(): SupabaseClient {
  if (!client) {
    throw new Error('Le service d’administration partagé n’est pas configuré.');
  }
  return client;
}

export const adminBackendService = {
  isConfigured(): boolean {
    return client !== null;
  },

  async signIn(email: string, password: string): Promise<void> {
    const supabase = requireClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: admin, error: adminError } = await supabase
      .from('app_admins')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      throw adminError ?? new Error('Ce compte n’est pas autorisé à administrer l’application.');
    }
    try {
      await this.logActivity('admin_login');
    } catch (activityError) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      throw activityError;
    }
  },

  async isAdminSession(): Promise<boolean> {
    if (!client) return false;
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) return false;
    const { data, error: adminError } = await client
      .from('app_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (adminError) throw adminError;
    return Boolean(data);
  },

  async signOut(): Promise<void> {
    const { error } = await requireClient().auth.signOut();
    if (error) throw error;
  },

  async changePassword(password: string): Promise<void> {
    const { error } = await requireClient().auth.updateUser({ password });
    if (error) throw error;
    try {
      await this.logActivity('password_changed');
    } catch {
      throw new Error('Le mot de passe a été modifié, mais son événement n’a pas pu être ajouté à l’historique.');
    }
  },

  async getBrandIcon(): Promise<string | null> {
    if (!client) return null;
    const { data, error } = await client
      .from('app_settings')
      .select('value')
      .eq('key', 'brand_icon')
      .maybeSingle();
    if (error) throw error;
    return typeof data?.value === 'string' ? data.value : null;
  },

  async uploadBrandIcon(file: File): Promise<string> {
    const supabase = requireClient();
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Choisissez une image PNG, JPEG ou WebP.');
    }
    if (typeof createImageBitmap !== 'function') {
      throw new Error('Ce navigateur ne permet pas de vérifier les dimensions de l’image.');
    }
    if (file.size > 3 * 1024 * 1024) {
      throw new Error('L’image doit faire 3 Mo maximum.');
    }

    const image = await createImageBitmap(file);
    const isSquare = image.width === image.height;
    const dimensionsAreSafe = image.width >= 128 && image.width <= 4096;
    image.close();
    if (!isSquare) {
      throw new Error('Pour le logo de l’application, l’image doit être carrée.');
    }
    if (!dimensionsAreSafe) {
      throw new Error('L’image doit mesurer entre 128 et 4096 pixels de côté.');
    }

    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const { error: uploadError } = await supabase.storage
      .from('branding')
      .upload(`app-icon.${extension}`, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type,
      });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('branding')
      .getPublicUrl(`app-icon.${extension}`);
    const iconUrl = `${publicUrl}?v=${Date.now()}`;
    const { error: settingError } = await supabase
      .from('app_settings')
      .upsert({ key: 'brand_icon', value: iconUrl }, { onConflict: 'key' });
    if (settingError) throw settingError;
    try {
      await this.logActivity('brand_icon_updated');
    } catch {
      throw new Error('Le logo a été publié, mais son événement n’a pas pu être ajouté à l’historique.');
    }
    return iconUrl;
  },

  async getAdminActivity(): Promise<AdminActivity[]> {
    const { data, error } = await requireClient()
      .from('admin_activity')
      .select('id, action, details, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as AdminActivity[];
  },

  async logActivity(action: string, details: Record<string, string | number> = {}): Promise<void> {
    const { error } = await requireClient()
      .from('admin_activity')
      .insert({ action, details });
    if (error) throw error;
  },

  async getSharedSongs(): Promise<Song[]> {
    if (!client) return [];
    const { data, error } = await client
      .from('shared_songs')
      .select('song')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(row => row.song as Song);
  },

  async saveSharedSong(song: Song): Promise<void> {
    const { error } = await requireClient()
      .from('shared_songs')
      .upsert({ id: song.id, song }, { onConflict: 'id' });
    if (error) throw error;
    try {
      await this.logActivity('song_saved', { songNumber: song.number });
    } catch {
      throw new Error('Le chant a été enregistré, mais son événement n’a pas pu être ajouté à l’historique.');
    }
  },

  async getPublicAnnouncements(): Promise<string[] | null> {
    if (!client) return null;
    const { data, error } = await client
      .from('app_settings')
      .select('value')
      .eq('key', 'announcements')
      .maybeSingle();
    if (error) throw error;
    return Array.isArray(data?.value) && data.value.every(item => typeof item === 'string')
      ? data.value as string[]
      : null;
  },

  async saveAnnouncements(announcements: string[]): Promise<void> {
    if (announcements.length > 20 || announcements.some(item => item.length > 500)) {
      throw new Error('Limitez les annonces à 20 éléments de 500 caractères maximum chacun.');
    }
    const { error } = await requireClient()
      .from('app_settings')
      .upsert({ key: 'announcements', value: announcements }, { onConflict: 'key' });
    if (error) throw error;
    try {
      await this.logActivity('announcements_updated', { count: announcements.length });
    } catch {
      throw new Error('Les annonces ont été publiées, mais leur événement n’a pas pu être ajouté à l’historique.');
    }
  },
};
