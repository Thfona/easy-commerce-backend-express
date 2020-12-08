class GeneralFunctionsUtil {
  public getKeyValue: any = (key: string): any => (obj: Record<string, any>): any => obj[key];

  public capitalizeFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

export const generalFunctionsUtil = new GeneralFunctionsUtil();
