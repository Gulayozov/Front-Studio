import { request } from '@umijs/max';

// /
//  * Upload files to the backend for general storage (List.tsx)
//  * @param files - Array of File objects to upload
//  */
export async function uploadFile(files: File | File[]) {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    formData.append('files', file);
  });
  formData.append('for_rag_context', 'false');

  return request('/api/v1/rag/upload-file/', {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });
}

// /
//  * Upload files specifically for RAG context (ChatDialog.tsx)
//  * @param files - Array of File objects to upload for LLM context
//  */
export async function uploadFileForRAG(files: File | File[]) {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    formData.append('files', file);
  });
  formData.append('for_rag_context', 'true');

  return request('/api/v1/rag/upload-file/', {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });
}

// /
//  * Transcribe audio file using STT service
//  * @param audioBlob - Audio blob to transcribe
//  * @returns transcribed text
//  */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  const formData = new FormData();
  // Use a more generic filename that matches backend expectations
  formData.append('file', audioBlob, 'audio.webm');

  return request('/api/v1/api/v1/stt/tajik/', {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });
}

// /
//  * Ask a question to the RAG model
//  * @param question - User's question
//  * @returns response with the answer
//  */
export async function askQuestion(question: string): Promise<{ answer: string }> {
  return request(`/api/v1/rag/query?question=${encodeURIComponent(question)}`, {
    method: 'POST',
    // No data/body needed
  });
}

// /
//  * Trigger download of a file from S3 by filename only
//  * @param filename - Name of the file in the bucket
//  */
export function downloadFile(filename: string) {
  const encoded = encodeURIComponent(filename);
  window.open(`/api/v1/s3/download_file?filename=${encoded}`, '_blank');
}

//  * Get list of files in S3 bucket
//  * @returns array of file info objects
//  */
export async function listFiles(): Promise<Array<{ filename: string; path: string; download_url: string }>> {
  return request('/api/v1/rag/list_files', {
    method: 'GET',
  });
}