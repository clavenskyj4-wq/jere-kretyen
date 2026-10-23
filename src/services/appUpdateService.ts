export interface AppUpdateInfo {
  buildId: string;
  releaseNotes: string;
}

interface PublishedAppVersion {
  buildId?: unknown;
  buildNumber?: unknown;
  releaseNotes?: unknown;
}

export const ANDROID_BUILD_WORKFLOW_URL =
  'https://github.com/clavenskyj4-wq/jere-kretyen/actions/workflows/build-android.yml';

const APP_VERSION_URL =
  'https://clavenskyj4-wq.github.io/jere-kretyen/app-version.json';

export async function checkForAppUpdate(signal: AbortSignal): Promise<AppUpdateInfo | null> {
  const currentBuildId = import.meta.env.VITE_APP_BUILD_ID;
  const currentBuildNumber = Number(import.meta.env.VITE_APP_BUILD_NUMBER);
  if (!currentBuildId || currentBuildId === 'development' || !Number.isInteger(currentBuildNumber)) {
    return null;
  }

  const url = new URL(APP_VERSION_URL);
  url.searchParams.set('check', Date.now().toString());
  const response = await fetch(url, { cache: 'no-store', signal });
  if (!response.ok) {
    throw new Error(`La vérification de mise à jour a échoué (${response.status}).`);
  }

  const published: PublishedAppVersion = await response.json();
  if (
    typeof published.buildId !== 'string' ||
    typeof published.buildNumber !== 'number' ||
    published.buildId === currentBuildId ||
    published.buildNumber <= currentBuildNumber
  ) {
    return null;
  }

  return {
    buildId: published.buildId,
    releaseNotes: typeof published.releaseNotes === 'string' ? published.releaseNotes : '',
  };
}
