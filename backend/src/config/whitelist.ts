//whishlist, only this origin can have access to our backend
export const whitelist: string[] = [process.env.FRONTEND_HOST || ""];
