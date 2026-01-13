import { Page } from '@playwright/test';
export declare const TEST_URL = "http://localhost:3000/e2e";
export declare const LOAD_TIMEOUT = 5000;
export declare function waitForMapLoad(page: Page, selector?: string): Promise<void>;
