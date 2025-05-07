import { Injectable } from '@nestjs/common';
import { ErrorMessages } from './constants/error-messages.const';
import { SuccessMessages } from './constants/success-messages.const';
import { UIMessages } from './constants/ui-messages.const';

type MessageSource =
  | typeof ErrorMessages
  | typeof SuccessMessages
  | typeof UIMessages;

@Injectable()
export class MessagesService {
  private getMessageValue<T extends MessageSource, K extends keyof T>(
    source: T,
    category: K,
    key: keyof T[K],
  ): string {
    return source[category][key] as unknown as string;
  }

  getError<T extends keyof typeof ErrorMessages>(
    category: T,
    key: keyof (typeof ErrorMessages)[T],
    params?: Record<string, string | number>,
  ): string {
    const message = this.getMessageValue(ErrorMessages, category, key);
    return this.formatMessage(message, params);
  }

  getSuccess<T extends keyof typeof SuccessMessages>(
    category: T,
    key: keyof (typeof SuccessMessages)[T],
    params?: Record<string, string | number>,
  ): string {
    const message = this.getMessageValue(SuccessMessages, category, key);
    return this.formatMessage(message, params);
  }

  getUI<T extends keyof typeof UIMessages>(
    category: T,
    key: keyof (typeof UIMessages)[T],
    params?: Record<string, string | number>,
  ): string {
    const message = this.getMessageValue(UIMessages, category, key);
    return this.formatMessage(message, params);
  }

  private formatMessage(
    message: string,
    params?: Record<string, string | number>,
  ): string {
    if (!params) return message;

    return Object.entries(params).reduce((msg, [key, value]) => {
      return msg.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }, message);
  }
}
