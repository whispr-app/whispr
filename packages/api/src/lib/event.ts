export default class Event {
  private connections: ((...args: unknown[]) => void)[];
  constructor() {
    this.connections = [];
  }

  public subscribe = (callback: (...args: unknown[]) => void) => {
    let active = true;

    const wrappedCallback = (...args: unknown[]) =>
      active ? callback(...args) : undefined;

    this.connections.push(wrappedCallback);

    return () => (active = false);
  };

  public fire = (...args: unknown[]) => {
    this.connections.forEach(callback =>
      setTimeout(() => callback(...args), 0)
    );
  };
}
