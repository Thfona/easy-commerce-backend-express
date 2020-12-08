import { generalFunctionsUtil } from './general-functions.util';

class ErrorMessageUtil {
  public parseErrorMessage(message: string): string {
    if (!message) {
      return '';
    }

    const parsedMessage = generalFunctionsUtil.capitalizeFirstLetter(message.replace(/"/g, '').replace(/\\/g, ''));

    if (!(parsedMessage.slice(-1) === '.')) {
      parsedMessage.concat('.');
    }

    return parsedMessage;
  }
}

export const errorMessageUtil = new ErrorMessageUtil();
