export const apiValidation = async (file: any) => {
  const formData = new FormData();

  const fileToUpload = {
    uri: file.uri,
    name: file.name,
    // O document picker nos dá o mimeType correto!
    type: file.mimeType || "application/octet-stream",
  };

  // 'file' é o nome do campo que o seu servidor espera para o arquivo.
  formData.append("file", fileToUpload);
  console.log(
    "process.env.EXPO_PUBLIC_API_VALIDATION",
    process.env.EXPO_PUBLIC_API_VALIDATION
  );
  fetch(process.env.EXPO_PUBLIC_API_VALIDATION || "", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `ApiKey ${process.env.EXPO_PUBLIC_KEY_VALIDATION}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("data", data);
    })
    .catch((error) => {
      console.log("error", error);
    });
};
