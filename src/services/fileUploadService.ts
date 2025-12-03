const API_BASE_URL = import.meta.env.VITE_API_URL;

class FileUploadService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Upload a file to S3 and get the URL back
   * @param file The file to upload
   * @param folder The S3 folder (e.g., 'facilities', 'courts', 'profiles')
   * @returns The S3 URL of the uploaded file
   */
  async uploadFile(file: File, folder: string = 'facilities'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Get token for authorization
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // DO NOT set Content-Type - browser will set it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url || data.imageUrl;
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;
