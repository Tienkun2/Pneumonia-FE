/**
 * Standardizes error message extraction from various error types
 */
export const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    
    if (error instanceof Error) return error.message;
    
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    
    return "Đã có lỗi xảy ra, vui lòng thử lại sau";
};
