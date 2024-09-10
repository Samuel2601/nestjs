// src/common/helpers/apiResponse.ts
export function apiResponse(status: number, message: string, data: any, error: any) {
  return {
    status,
    message,
    data,
    error,
  };
}
