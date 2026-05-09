const getData = (key: string): unknown | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const data = localStorage.getItem(key);

    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Read from local storage', error);
  }
};

const setData = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Save in local storage', error);
  }
};

export { getData, setData };
