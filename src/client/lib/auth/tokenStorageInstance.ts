import { LocalStorageTokenStorage } from "./LocalStorageTokenStorage";
import type { TokenStorage } from "./TokenStorage";

/** Shared `TokenStorage` instance used across the app. */
export const tokenStorage: TokenStorage = new LocalStorageTokenStorage();
