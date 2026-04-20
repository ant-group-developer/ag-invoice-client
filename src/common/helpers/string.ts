/**
 * Loại bỏ dấu tiếng Việt khỏi chuỗi
 * @param str Chuỗi cần xử lý
 * @returns Chuỗi không dấu
 */
export const removeVietnameseTones = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

/**
 * Đệ quy loại bỏ dấu tiếng Việt cho tất cả các trường string trong một object/array
 * @param data Dữ liệu cần xử lý (Object, Array, hoặc String)
 * @returns Dữ liệu đã được loại bỏ dấu
 */
export const sanitizeInvoiceData = (data: any): any => {
    if (typeof data === 'string') {
        return removeVietnameseTones(data);
    }
    
    if (Array.isArray(data)) {
        return data.map((item) => sanitizeInvoiceData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
        // Nếu là Dayjs object hoặc Date object thì bỏ qua, không xử lý đệ quy vào sâu hơn
        if (data.$$typeof || data instanceof Date || (data._isAMomentObject !== undefined)) {
            return data;
        }

        const newData: any = {};
        for (const key in data) {
            // Danh sách các trường không nên loại bỏ dấu (ví dụ: base64 image, url)
            if (
                key === 'signatureImage' || 
                key === 'signatureUploadBase64' || 
                key === 'url' || 
                key === 'preview'
            ) {
                newData[key] = data[key];
            } else {
                newData[key] = sanitizeInvoiceData(data[key]);
            }
        }
        return newData;
    }
    
    return data;
};
