const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface FetchRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
const api = async (
  endPoint: string,
  method: string = "GET",
  option: FetchRequestOptions
) => {
  // Construct the full URL
  const url = `${baseURL}${endPoint}`;

  try {
    // Make the request using Fetch
    const response = await fetch(url, {
      method, // Use the specified method (GET, POST, etc.)
      headers, // Use the merged headers
      ...option, // Include other options like body
    });

    // Check if the response is okay
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Parse the JSON response and cast it to the generic type T
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // Optionally re-throw the error
  }
};

export default api;
