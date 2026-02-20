import clipboardy from "clipboardy";

export const clipboard = {
  read: async (): Promise<string> => {
    try {
      return await clipboardy.read();
    } catch (error) {
      throw new Error("Failed to read from clipboard");
    }
  },
  write: async (content: string): Promise<void> => {
    try {
      await clipboardy.write(content);
    } catch (error) {
      throw new Error("Failed to write to clipboard");
    }
  },
};
