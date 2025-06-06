// apiService.ts
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    let data: unknown = undefined;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    if (!res.ok) {
      return {
        error:
          typeof data === "object" && data !== null && "error" in data
            ? (data as { error: string }).error
            : typeof data === "string"
            ? data
            : "API 請求失敗",
        status: res.status,
      };
    }
    return { data: data as T, status: res.status };
  } catch (e) {
    return { error: (e as Error).message || "API 請求異常", status: 0 };
  }
}

// 範例用法：
// const { data, error, status } = await apiRequest<Lesson[]>("/api/lessons");
