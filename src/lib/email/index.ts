export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailAdapter {
  send(options: SendEmailOptions): Promise<{ success: boolean; id?: string }>;
}

export class ConsoleEmailAdapter implements EmailAdapter {
  async send(options: SendEmailOptions): Promise<{ success: boolean; id?: string }> {
    console.log("------------------------------------------");
    console.log(`[EMAIL DISPATCH] To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body (text): ${options.text || options.html.replace(/<[^>]*>?/gm, "")}`);
    console.log("------------------------------------------");
    return { success: true, id: `mock_${Date.now()}` };
  }
}

let emailInstance: EmailAdapter | null = null;

export function getEmailAdapter(): EmailAdapter {
  if (!emailInstance) {
    emailInstance = new ConsoleEmailAdapter();
  }
  return emailInstance;
}

