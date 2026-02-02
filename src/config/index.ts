import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
  botToken: string;
  clientId: string;
  webhookUrl: string;
}

const config: Config = {
  botToken: process.env.BOT_TOKEN!,
  clientId: process.env.CLIENT_ID!,
  webhookUrl: process.env.N8N_WEBHOOK_URL!,
};

export function validateConfig(): void {
  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export default config;
