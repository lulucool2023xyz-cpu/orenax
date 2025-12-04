import * as fs from 'fs';
import * as path from 'path';

/**
 * Bootstrap script for production environment
 * Handles Google Cloud credentials from environment variable
 */
export function bootstrapProduction(): void {
    // Check if running in production and GOOGLE_CREDENTIALS_JSON is set
    if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CREDENTIALS_JSON) {
        try {
            // Decode base64 credentials
            const credentialsJson = Buffer.from(
                process.env.GOOGLE_CREDENTIALS_JSON,
                'base64'
            ).toString('utf-8');

            // Validate it's valid JSON
            JSON.parse(credentialsJson);

            // Write to temporary file
            const credentialsPath = path.join(process.cwd(), 'gcp-credentials.json');
            fs.writeFileSync(credentialsPath, credentialsJson, { mode: 0o600 });

            // Set the environment variable for Google Cloud SDK
            process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

            console.log('[Bootstrap] Google Cloud credentials configured from environment');
        } catch (error) {
            console.error('[Bootstrap] Failed to configure Google Cloud credentials:', error.message);
        }
    }

    // Log environment info (without sensitive data)
    console.log('[Bootstrap] Environment:', process.env.NODE_ENV || 'development');
    console.log('[Bootstrap] Port:', process.env.PORT || 3001);
}
