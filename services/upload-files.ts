import api from "./api";

export const solicitarLinkS3 = async (filename:any, contentType:any) => {
 try {
    const response = await api.post('/v1/generate-presigned-url', {
      filename: filename,
      content_type: contentType
    });
    return response.data;
 } catch (error:any) {
    console.log('error',error)
 }
}

export const uploadArquivoParaS3 = async (uploadUrl:any, arquivo:any, contentType:any) => {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: arquivo,
      headers: {
        'Content-Type': contentType
      }
    });
     if (!response.ok) {
      throw new Error(`Upload falhou com status: ${response.status}`);
    }
    return true;
  } catch (error:any) {
    throw error;
  }
}
