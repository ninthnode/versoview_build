const getPdfSlides = async (selectedPdf) => {
  try {
    // const pdfData = selectedPdf instanceof File ? selectedPdf : null;

    const formdata = new FormData();
    formdata.append("pdf", selectedPdf);

    // Fetch data from the API with selectedPdf in the request body
    const response = await fetch(
      "http://127.0.0.1:5001/api/v1/post/extractPdf",
      {
        method: "POST",
        // headers: {
        //   // "Content-Type": "application/pdf",
        // },
        body: formdata,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data, "resonse from api");

    // Pass the data to the page component as props
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        data: null,
      },
    };
  }
};

export default getPdfSlides;
