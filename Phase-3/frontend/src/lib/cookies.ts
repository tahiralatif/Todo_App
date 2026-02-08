// Simple cookie utility to replace js-cookie dependency
export const Cookies = {
  get: (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }
    return undefined;
  },

  set: (name: string, value: string, options?: { expires?: number }): void => {
    let cookie = `${name}=${value}`;
    if (options?.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      cookie += `; expires=${date.toUTCString()}`;
    }
    cookie += '; path=/';
    document.cookie = cookie;
  },

  remove: (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};