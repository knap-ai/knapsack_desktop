export declare function resolveGoogleOAuthIdentity(accessToken: string): Promise<{
    email?: string;
    projectId: string;
}>;
