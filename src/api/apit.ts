export const nasFileUpload = async (file: File) => {
  const nasURL = "http://boripharma.ipdisk.co.kr:5005/pharm_display/";
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(nasURL, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Basic ${btoa("webadmin:Bori8834")}`,
      },
    });
    console.log(response);
  } catch (error) {}
};
