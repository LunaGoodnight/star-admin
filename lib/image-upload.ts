/**
 * Handles image upload to the backend API with progress tracking and abort capability
 * @param file The file to upload
 * @param onProgress Optional callback for tracking upload progress
 * @param abortSignal Optional AbortSignal for cancelling the upload
 * @returns Promise resolving to the URL of the uploaded image
 */
export const uploadImageToBackend = async (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  // Validate file
  if (!file) {
    throw new Error("No file provided")
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
    )
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type. Allowed: jpg, png, gif, webp, avif")
  }

  try {
    // Get API URL and token from environment/localStorage
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.star.vividcats.org"
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (!token) {
      throw new Error("Authentication required. Please login first.")
    }

    // Create FormData for multipart upload
    const formData = new FormData()
    formData.append("file", file)

    // Upload to backend API
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress?.({ progress })
      }
    })

    // Handle abort signal
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        xhr.abort()
      })
    }

    // Create promise to handle the upload
    const uploadPromise = new Promise<string>((resolve, reject) => {
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            // The backend returns { url, key, contentType, size }
            resolve(response.url)
          } catch (error) {
            reject(new Error("Failed to parse upload response"))
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.error || "Upload failed"))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"))
      })

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"))
      })
    })

    // Open connection and send request
    xhr.open("POST", `${apiUrl}/api/uploads?prefix=blog`)
    xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.send(formData)

    return await uploadPromise
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred during upload")
  }
}
