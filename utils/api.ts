// Helper for API calls
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const fullUrl = `/api/${endpoint.replace(/^\//, '')}`; // Ensure only one slash and remove leading slash from endpoint if present

    const response = await fetch(fullUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API call to ${fullUrl} failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return {} as T; // No content for 204
    }
    
    return response.json();
}

export { apiCall };